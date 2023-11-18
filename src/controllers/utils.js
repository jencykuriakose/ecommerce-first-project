const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const twilio = require("twilio")(accountSid, authToken);

const sendOtp = (phone) => {
	return new Promise((resolve, reject) => {
		twilio.verify.v2
			.services(serviceSid)
			.verifications.create({ to: "+91" + phone, channel: "sms" })
			.then((verification) => {
				if (verification.status === "pending" || verification.status === "success") {
					resolve(true);
				}
			})
			.catch((error) => {
				console.log(error);
				reject(false);
			});
	});
};

const verifyOtp = (phone, otp) => {
	return new Promise((resolve, reject) => {
		twilio.verify.v2
			.services(serviceSid)
			.verificationChecks.create({ to: "+91" + phone, code: otp })
			.then((verification_check) => {
				console.log(verification_check.status);
				if (verification_check.status == "approved") {
					resolve(true);
				} else {
					reject(false);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	});
};

module.exports = {
	sendOtp,
	verifyOtp
};
