class User {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  get fullname() {
    // Issue #3 The object’s fields are only reachable through this
    return `${this.firstName} ${this.lastName}`;
  }
}

/*
 * Browser compatibility note:
 * Replaced Node.js `module.exports` with standard ES Module `export`
 * to prevent "ReferenceError: module is not defined" in the browser.
 */

export default User;
