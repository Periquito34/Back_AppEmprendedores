class User {
  constructor(uid, name, birthdate) {
    this.uid = uid; // ID único de Firebase
    this.name = name;
    this.birthdate = birthdate;
    this.createdAt = new Date();
  }
}

module.exports = User;
