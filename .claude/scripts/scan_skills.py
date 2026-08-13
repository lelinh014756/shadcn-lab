#!/usr/bin/env python3
"""
Scan .claude/skills directory and extract skill metadata.
"""

import re
import sys
from pathlib import Path
from typing import Dict, List
try:
    import yaml
except ModuleNotFoundError:
    raise SystemExit(
        "PyYAML is required. Install with: python3 -m pip install -r .claude/scripts/requirements.txt"
    )

# Ensure UTF-8 stdout on Windows consoles
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Exact mappings for skills whose names are ambiguous or don't match keyword heuristics.
EXACT_CATEGORY_MAP = {
    # Utilities
    "ask": "utilities",
    "ba": "utilities",
    "bootstrap": "utilities",
    "brainstorm": "utilities",
    "code-review": "utilities",
    "coding-level": "utilities",
    "context-engineering": "utilities",
    "cook": "utilities",
    "copywriting": "utilities",
    "debug": "utilities",
    "fix": "utilities",
    "journal": "utilities",
    "loop": "utilities",
    "plan": "utilities",
    "planning": "utilities",
    "predict": "utilities",
    "preview": "utilities",
    "problem-solving": "utilities",
    "project-management": "utilities",
    "project-organization": "utilities",
    "report-templates": "utilities",
    "research": "utilities",
    "retro": "utilities",
    "scenario": "utilities",
    "security": "utilities",
    "security-scan": "utilities",
    "sequential-thinking": "utilities",
    "task-decomposer": "utilities",
    "test": "utilities",
    "watzup": "utilities",
    # Documentation
    "api-docs": "docs",
    "docs": "docs",
    # Dev Tools
    "agent-browser": "dev-tools",
    "ccs": "dev-tools",
    "docs-seeker": "dev-tools",
    "find-skills": "dev-tools",
    "gkg": "dev-tools",
    "git": "dev-tools",
    "help": "dev-tools",
    "issue": "dev-tools",
    "kanban": "dev-tools",
    "markdown-novel-viewer": "dev-tools",
    "mcp-builder": "dev-tools",
    "mcp-management": "dev-tools",
    "mermaidjs-v11": "dev-tools",
    "mintlify": "dev-tools",
    "plans-kanban": "dev-tools",
    "repomix": "dev-tools",
    "scout": "dev-tools",
    "ship": "dev-tools",
    "team": "dev-tools",
    "use-mcp": "dev-tools",
    "web-testing": "dev-tools",
    "worktree": "dev-tools",
    # Frontend
    "stitch": "frontend",
    "winforms-controls": "frontend",
    # Frameworks
    "remotion": "frameworks",
    "tanstack": "frameworks",
    # Infrastructure
    "deploy": "infrastructure",
    # Multimedia
    "shader": "multimedia",
}


def normalize_skill_name(name: str) -> str:
    """Normalize skill name for category matching."""
    base_name = name.lower().split('/')[-1]
    if base_name.startswith('an-'):
        return base_name[3:]
    return base_name

def extract_frontmatter(content: str) -> Dict:
    """Extract YAML frontmatter from markdown content."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        try:
            return yaml.safe_load(match.group(1))
        except yaml.YAMLError:
            return {}
    return {}

def extract_first_paragraph(content: str) -> str:
    """Extract first meaningful paragraph after frontmatter."""
    # Remove frontmatter
    content = re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)

    # Find first paragraph (after headings)
    lines = content.split('\n')
    paragraph = []

    for line in lines:
        line = line.strip()
        # Skip headings and empty lines
        if line.startswith('#') or not line:
            if paragraph:  # If we've started collecting, stop
                break
            continue

        paragraph.append(line)

        # Stop after first paragraph
        if line.endswith('.') and len(' '.join(paragraph)) > 50:
            break

    return ' '.join(paragraph)[:200]

def scan_skills(base_path: Path) -> List[Dict]:
    """Scan all skill files and extract metadata."""
    skills = []

    for skill_file in sorted(base_path.rglob('SKILL.md')):
        # Get skill directory name
        skill_dir = skill_file.parent
        skill_name = skill_dir.name

        # Handle nested skills (like document-skills/*)
        if skill_dir.parent.name != 'skills':
            parent_name = skill_dir.parent.name
            skill_name = f"{parent_name}/{skill_name}"

        try:
            content = skill_file.read_text(encoding='utf-8')
            frontmatter = extract_frontmatter(content)

            description = frontmatter.get('description', '')
            if not description:
                description = extract_first_paragraph(content)

            # Categorize based on content/name
            category = categorize_skill(skill_name, description, content)

            skill_entry = {
                'name': skill_name,
                'path': str(skill_file.relative_to(Path('.claude/skills'))),
                'description': description,
                'category': category,
                'has_scripts': (skill_dir / 'scripts').exists(),
                'has_references': (skill_dir / 'references').exists()
            }

            # Include argument-hint if present in frontmatter
            argument_hint = frontmatter.get('argument-hint', '')
            if argument_hint:
                skill_entry['argument_hint'] = str(argument_hint)

            skills.append(skill_entry)
        except Exception as e:
            print(f"Error processing {skill_file}: {e}")

    return skills

def categorize_skill(name: str, description: str, content: str) -> str:
    """Categorize skill based on name and content."""
    lower_name = name.lower()
    normalized_name = normalize_skill_name(name)
    name_text = f"{lower_name} {normalized_name}"
    description_text = description.lower()

    for candidate in (lower_name, normalized_name):
        if candidate in EXACT_CATEGORY_MAP:
            return EXACT_CATEGORY_MAP[candidate]

    if lower_name.startswith('dotnet-'):
        return 'backend'
    if lower_name.startswith('ccs'):
        return 'dev-tools'

    # AI/ML
    if any(x in name_text for x in ['ai-', 'gemini', 'multimodal', 'adk']):
        return 'ai-ml'

    # Backend
    if any(x in name_text for x in ['backend', 'auth', 'payment']):
        return 'backend'

    # Database
    if any(x in name_text for x in ['database', 'databases', 'mongodb', 'postgresql', 'sql']):
        return 'database'

    # Infrastructure
    if any(x in name_text for x in ['devops', 'docker', 'cloudflare', 'gcloud']):
        return 'infrastructure'

    # Development Tools
    if any(x in name_text for x in ['mcp', 'skill-creator', 'repomix', 'docs-seeker']):
        return 'dev-tools'

    # Multimedia
    if any(x in name_text for x in ['media', 'chrome-devtools', 'document-skills']):
        return 'multimedia'

    # Frameworks
    if any(x in name_text for x in ['web-frameworks', 'mobile', 'shopify']):
        return 'frameworks'

    # Frontend
    if any(x in name_text for x in ['frontend', 'ui', 'design', 'aesthetic', 'threejs']):
        return 'frontend'

    # Documentation
    if any(x in name_text for x in ['docs', 'doc']) or any(x in description_text for x in ['documentation', 'readme']):
        return 'docs'

    # Utilities
    if any(x in name_text for x in ['debug', 'problem', 'code-review', 'planning', 'research', 'sequential']):
        return 'utilities'

    return 'other'

def group_by_category(skills: List[Dict]) -> Dict[str, List[Dict]]:
    """Group skills by category."""
    categories = {}

    for skill in skills:
        category = skill['category']
        if category not in categories:
            categories[category] = []
        categories[category].append(skill)

    return categories

def main():
    """Main execution."""
    base_path = Path('.claude/skills')

    if not base_path.exists():
        print(f"Error: {base_path} not found")
        return

    print("Scanning skills...")
    skills = scan_skills(base_path)

    print(f"\nFound {len(skills)} skills\n")

    # Group by category
    categories = group_by_category(skills)

    category_names = {
        'ai-ml': 'AI & Machine Learning',
        'frontend': 'Frontend & Design',
        'backend': 'Backend Development',
        'infrastructure': 'Infrastructure & DevOps',
        'database': 'Database & Storage',
        'dev-tools': 'Development Tools',
        'multimedia': 'Multimedia & Processing',
        'frameworks': 'Frameworks & Platforms',
        'utilities': 'Utilities & Helpers',
        'docs': 'Documentation',
        'other': 'Other'
    }

    for category, skills_list in sorted(categories.items()):
        print(f"\n{category_names.get(category, category.upper())}:")
        for skill in skills_list:
            scripts = '📦' if skill['has_scripts'] else '  '
            refs = '📚' if skill['has_references'] else '  '
            print(f"  {scripts}{refs} {skill['name']:30} {skill['description'][:80]}")

    # Output YAML to an-help scripts directory
    output_path = Path('.claude/skills/an-help/scripts/skills_data.yaml')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(yaml.dump(skills, allow_unicode=True, default_flow_style=False), encoding='utf-8')
    print(f"\n✓ Saved metadata to {output_path}")

    # Legacy location now points to canonical source to avoid data drift.
    legacy_path = Path('.claude/scripts/skills_data.yaml')
    legacy_path.write_text(
        "# Skills catalog moved to .claude/skills/an-help/scripts/skills_data.yaml\n"
        "# Regenerate via: python3 .claude/scripts/scan_skills.py\n",
        encoding='utf-8',
    )

if __name__ == '__main__':
    main()
