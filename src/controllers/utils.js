// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceSid = process.env.TWILIO_SERVICE_SID;
// const twilio = require("twilio")(accountSid, authToken);

// const sendOtp = (phone) => {
//     return new Promise((resolve, reject) => {
//         twilio.verify.v2
//             .services(serviceSid)
//             .verifications.create({ to: "+91" + phone, channel: "sms" })
//             .then((verification) => {
// 				console.log(verification.status)
//                 if (verification.status === "pending" || verification.status === "success") {
//                     console.log("OTP sent successfully. OTP:", verification.code);
//                     resolve(true);
//                 }
//             })
//             .catch((error) => {
//                 console.error("Error sending OTP:", error);
//                 reject(false);
//             });
//     });
// };

// 	const verifyOtp = (phone, otp) => {
// 		return new Promise((resolve, reject) => {
// 			twilio.verify.v2
// 				.services(serviceSid)
// 				.verificationChecks.create({ to: "+91" + phone, code: otp })
// 				.then((verification_check) => {
// 					console.log(verification_check.status);
// 					if (verification_check.status == "approved") {
// 						resolve(true);
// 					} else {
// 						reject(false);
// 					}
// 				})
// 				.catch((error) => {
// 					console.log(error);
// 				});
// 		});
// 	};

// module.exports = {
// 	sendOtp,
// 	verifyOtp
// };

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "jjencykuriakose@gmail.com",
		pass: "wqwd xocr leus gwyd"
	}
});

// Create a nodemailer transporter
const sendOtp = async (email, otp) => {
    console.log(email,otp);
	const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: "OTP Verification",
		text: `Your OTP is: ${otp}`
	};

	try {
		await transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.log("_______", err, "______");
			}
			if (!err) {
				console.log(info.response);
                console.log('-----------',otp,'----------');
			}
		});
		return true; // Return true if sending email is successful
	} catch (error) {
		console.error("Error sending OTP email:", error);
		return false; // Return false if there is an error sending email
	}
};

// Function to verify OTP
const verifyOtp = (req, res, userEnteredOtp) => {
	try {
		const storedOtp = req.session.otp;

		if (userEnteredOtp === storedOtp) {
			// OTPs match, sending success response
			res.status(200).json({ success: true });
		} else {
			// OTPs do not match, sending error response
			res.status(400).json({ error: "Invalid OTP" });
		}
	} catch (error) {
		console.error("Error in verifyOtp:", error);
		// Handle the error and send an appropriate response
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	sendOtp,
	verifyOtp
};
