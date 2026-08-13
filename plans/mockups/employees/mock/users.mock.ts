export type MockUser = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
};

export const MOCK_USERS: MockUser[] = [
  { id: 1, username: "admin", email: "admin@landsoft.vn", fullName: "Administrator", roleName: "Admin" },
  { id: 2, username: "ttbinh", email: "ttbinh@landsoft.vn", fullName: "Trần Thị Bình", roleName: "User" },
  { id: 3, username: "lvcuong", email: "lvcuong@landsoft.vn", fullName: "Lê Văn Cường", roleName: "User" },
  { id: 5, username: "hvem", email: "hvem@landsoft.vn", fullName: "Hoàng Văn Em", roleName: "User" },
  { id: 6, username: "motle", email: "motle@landsoft.vn", fullName: "Nguyễn Văn Một", roleName: "User" },
  { id: 7, username: "hainguyen", email: "hainguyen@landsoft.vn", fullName: "Nguyễn Thị Hải", roleName: "User" },
];
