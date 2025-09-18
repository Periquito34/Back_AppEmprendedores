class User {
  constructor(uid, name, birthdate, numeroDeTelefono) {
    this.uid = uid; // ID único de Firebase
    this.name = name;
    this.birthdate = birthdate;
    this.numeroDeTelefono = numeroDeTelefono;
    this.createdAt = new Date();
  }
}

module.exports = User;
