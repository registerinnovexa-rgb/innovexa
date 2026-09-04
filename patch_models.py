with open('api/models.js', 'r') as f:
    models = f.read()

otp_model = """// Registration OTPs
const RegistrationOTPSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  timestamp: { type: Date, default: Date.now, expires: 600 }
});
export const RegistrationOTP = mongoose.models.RegistrationOTP || mongoose.model('RegistrationOTP', RegistrationOTPSchema);

// Admin Presence"""

models = models.replace("// Admin Presence", otp_model)

with open('api/models.js', 'w') as f:
    f.write(models)
