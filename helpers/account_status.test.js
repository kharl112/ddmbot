const Status = require("./account_status");

test("account_status: Status type object", () => {
  expect(Status).toEqual({getStatus: Status.getStatus});
});

test("account_status: 0 argument returns Offline", () => {
  expect(Status.getStatus(0)).toBe("Offline");
});

test("account_status: null argument returns Offline", () => {
  expect(Status.getStatus()).toBe("Offline");
});

test("account_status: NaN argument returns Offline", () => {
  expect(Status.getStatus("lksdfh")).toBe("Offline");
});

test("account_status: greater status_array_length argument returns Custom status", () => {
  expect(Status.getStatus(100)).toBe("Custom status");
});
