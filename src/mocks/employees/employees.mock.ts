import { faker } from "@faker-js/faker";

import { createMockStore } from "@/lib/mock/mock-store";
import {
  type Employee,
  genders,
  idTypes,
  type StaffStatusId,
} from "./employee.types";
import {
  bankCodes,
  departments,
  jobTitlesByDepartment,
  organizations,
  positions,
} from "./employees-lookups.mock";

const EMPLOYEE_COUNT = 480;
const EMPLOYEE_SEED = 20260814;

const firstNames = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Huỳnh",
  "Phan",
  "Vũ",
  "Võ",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Hồ",
  "Ngô",
  "Dương",
];

const middleNames = [
  "Văn",
  "Thị",
  "Hữu",
  "Đức",
  "Minh",
  "Quang",
  "Ngọc",
  "Thu",
];

const lastNames = [
  "An",
  "Bình",
  "Cường",
  "Dung",
  "Em",
  "Giang",
  "Hà",
  "Khoa",
  "Lan",
  "Mai",
  "Nam",
  "Oanh",
  "Phúc",
  "Quân",
  "Sơn",
  "Trang",
  "Uyên",
  "Vinh",
  "Xuân",
  "Yến",
];

const streets = [
  "Nguyễn Trãi",
  "Lê Lợi",
  "Trần Hưng Đạo",
  "Điện Biên Phủ",
  "Võ Văn Tần",
  "Cách Mạng Tháng 8",
  "Hai Bà Trưng",
  "Nguyễn Thị Minh Khai",
];

const noteSamples = [
  "Nhân viên xuất sắc, hoàn thành vượt chỉ tiêu quý.",
  "Đang tham gia chương trình đào tạo nội bộ.",
  "Chuyển công tác từ chi nhánh Hà Nội.",
  "Cần bổ sung hồ sơ bảo hiểm.",
  null,
  null,
];

/** Strip Vietnamese diacritics for email / bank-account-name fields. */
function toAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0] ?? "";
}

export function generateEmployee(index: number): Employee {
  const id = index + 1;

  const family = faker.helpers.arrayElement(firstNames);
  const middle = faker.helpers.arrayElement(middleNames);
  const given = faker.helpers.arrayElement(lastNames);
  const fullName = `${family} ${middle} ${given}`;
  const asciiName = toAscii(fullName);
  const slug = asciiName.toLowerCase().replace(/\s+/g, ".");

  const department = faker.helpers.arrayElement(departments);
  const position = faker.helpers.arrayElement(positions);
  const organization = faker.helpers.arrayElement(organizations);

  const staffStatusId = faker.helpers.arrayElement([
    1, 1, 1, 1, 2, 3,
  ]) as StaffStatusId;
  const isActive = staffStatusId !== 3;

  const startDate = faker.date.between({
    from: "2015-01-01",
    to: "2025-06-01",
  });
  const dateOfBirth = faker.date.between({
    from: "1980-01-01",
    to: "2003-12-31",
  });
  const createdAt = faker.date.between({ from: startDate, to: new Date() });
  const hasUpdate = faker.datatype.boolean({ probability: 0.6 });

  const hasLinkedUser = faker.datatype.boolean({ probability: 0.55 });
  const hasManager =
    position.id > 2 && faker.datatype.boolean({ probability: 0.8 });

  return {
    id,
    code: `NV${String(id).padStart(4, "0")}`,
    fullName,
    workEmail: `${slug}@landsoft.vn`,
    personalEmail: `${slug}${faker.number.int({ min: 1, max: 99 })}@gmail.com`,
    departmentId: department.id,
    departmentName: department.name,
    organizationId: organization.id,
    organizationName: organization.name,
    isActive,

    gender: faker.helpers.arrayElement(genders),
    dateOfBirth: toIsoDate(dateOfBirth),
    personalPhone: `09${faker.string.numeric(8)}`,
    address: `${faker.number.int({ min: 1, max: 999 })} ${faker.helpers.arrayElement(streets)}, Quận ${faker.number.int({ min: 1, max: 12 })}, TP.HCM`,

    idtype: faker.helpers.arrayElement(idTypes),
    idnumber: faker.string.numeric(12),
    idissuedDate: toIsoDate(
      faker.date.between({ from: "2018-01-01", to: "2024-12-31" }),
    ),
    idissuedPlace: "Cục Cảnh sát QLHC về TTXH",

    positionId: position.id,
    positionName: position.name,
    jobTitle: faker.helpers.arrayElement(
      jobTitlesByDepartment[department.id] ?? ["Nhân viên"],
    ),
    workPhone: `028${faker.string.numeric(7)}`,
    startDate: toIsoDate(startDate),
    endDate:
      staffStatusId === 3 ? toIsoDate(faker.date.recent({ days: 400 })) : null,
    staffStatusId,
    managerId: hasManager ? faker.number.int({ min: 1, max: 20 }) : null,
    managerName: hasManager
      ? `${faker.helpers.arrayElement(firstNames)} ${faker.helpers.arrayElement(middleNames)} ${faker.helpers.arrayElement(lastNames)}`
      : null,

    taxNumber: faker.string.numeric(13),
    bankAccount: faker.string.numeric(10),
    bankAccountName: asciiName.toUpperCase(),
    bankCode: faker.helpers.arrayElement(bankCodes),

    userName: hasLinkedUser ? slug : null,
    hasLinkedUser,

    notes: faker.helpers.arrayElement(noteSamples),

    createdAt: createdAt.toISOString(),
    createdByName: "Admin",
    updatedAt: hasUpdate
      ? faker.date.between({ from: createdAt, to: new Date() }).toISOString()
      : null,
    updatedByName: hasUpdate ? "Admin" : "",
  };
}

function seedEmployees(): Employee[] {
  faker.seed(EMPLOYEE_SEED);
  const rows = Array.from({ length: EMPLOYEE_COUNT }, (_, index) =>
    generateEmployee(index),
  );
  faker.seed();
  return rows;
}

export const employeesStore = createMockStore<Employee>({
  seed: seedEmployees,
  getKey: (employee) => String(employee.id),
});
