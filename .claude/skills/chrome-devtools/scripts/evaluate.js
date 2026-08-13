#!/usr/bin/env node
/**
 * Execute JavaScript in page context
 * Usage: node evaluate.js --script "document.title" [--url https://example.com]
 */
import { getBrowser, getPage, closeBrowser, disconnectBrowser, rememberPageSelection, healthCheckPage, ensurePageReady, parseArgs, outputJSON, outputError } from './lib/browser.js';

async function evaluate() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.script) {
    outputError(new Error('--script is required'));
    return;
  }

  try {
    const browser = await getBrowser({
      headless: args.headless
    });

    const page = await getPage(browser, {
      preferUrl: args.url,
    });

    // Navigate if URL provided
    if (args.url) {
      await page.goto(args.url, {
        waitUntil: args['wait-until'] || 'networkidle2'
      });
      await rememberPageSelection(page, {
        reason: 'evaluate:navigate',
        intentUrl: args.url,
      });
    } else {
      await ensurePageReady(page, {
        action: 'evaluate script on the current page',
      });
    }

    const result = await page.evaluate(async (script) => {
      // Wrap in async IIFE so user scripts can use await
      // eslint-disable-next-line no-eval
      try {
        const rawResult = await eval(`(async () => { return ${script}; })()`);
        // Handle complex objects by stringifying in page context
        if (typeof rawResult === 'object' && rawResult !== null) {
          return { __serialized: JSON.stringify(rawResult) };
        }
        return rawResult;
      } catch (e) {
        return { __error: String(e.message || e) };
      }
    }, args.script);

    // Deserialize if wrapped
    let finalResult = result;
    if (result && typeof result === 'object' && result.__serialized) {
      try {
        finalResult = JSON.parse(result.__serialized);
      } catch (e) {
        finalResult = result.__serialized; // Fallback to string
      }
    } else if (result && typeof result === 'object' && result.__error) {
      outputError(new Error(result.__error));
      return;
    }

    outputJSON({
      success: true,
      result: finalResult,
      url: page.url(),
      pageSelection: page.__ckPageSelection || null,
      pageHealth: await healthCheckPage(page, {
        expectedUrl: args.url || null,
        allowAboutBlank: false,
      }),
    });

    // Default: disconnect to keep browser running for session persistence
    // Use --close true to fully close browser
    if (args.close === 'true') {
      await closeBrowser();
    } else {
      await disconnectBrowser();
    }
    process.exit(0);
  } catch (error) {
    outputError(error);
    process.exit(1);
  }
}

evaluate();
