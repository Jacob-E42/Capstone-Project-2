"use strict";

import Request from "../api";

async function commonBeforeAll() {
	let request = new Request();
	await request.register("U1F", "U1L", "user1@user.com", "password1", ["interest1", "interest2"]);

	await User.register("U1F", "U1L", "user1@user.com", "password1", ["interest1", "interest2"]);
	await User.register("U2F", "U2L", "user2@user.com", "password2", ["interest2", "interest3"]);
	await User.register("U3F", "U3L", "user3@user.com", "password3", ["interest1", "interest3"]);
}

async function commonBeforeEach() {
	await db.query("BEGIN");
}

async function commonAfterEach() {
	await db.query("ROLLBACK");
}

async function commonAfterAll() {
	// End the database connection
	try {
		await db.end();
		console.log("Database connection closed");
	} catch (err) {
		console.error("Error closing database connection:", err);
	}
}

const u1Token = createToken({ email: "user1@user.com" });
const u2Token = createToken({ email: "user2@user.com" });
const u3Token = createToken({ email: "user3@user.com" });

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,

	u1Token,
	u2Token,
	u3Token
};
