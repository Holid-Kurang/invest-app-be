// Business Constants
const BUSINESS = {
    ANNUAL_RETURN_RATE: 0.12, // 12% annual return
    DAYS_IN_YEAR: 365,
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 10000000000, // 10 billion
    MIN_WITHDRAWAL: 100000, // 100k minimum withdrawal
    BCRYPT_SALT_ROUNDS: 10,
    JWT_EXPIRES_IN: '24h',
    FILE_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB
};

// Status Constants
const STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    REJECTED: 'rejected',
};

// Status Display Names
const STATUS_DISPLAY = {
    [STATUS.SUCCESS]: 'Successful',
    [STATUS.PENDING]: 'Pending',
    [STATUS.REJECTED]: 'Rejected',
};

// User Roles
const ROLE = {
    INVESTOR: 'investor',
    ADMIN: 'admin',
};

// Transaction Types
const TRANSACTION_TYPE = {
    INVESTMENT: 'Investment',
    WITHDRAWAL: 'Withdrawal',
};

// Error Messages
const ERROR_MESSAGES = {
    SERVER_ERROR: 'Terjadi kesalahan server',
    UNAUTHORIZED: 'Tidak memiliki akses',
    INVALID_CREDENTIALS: 'Email atau password salah',
    USER_NOT_FOUND: 'User tidak ditemukan',
    INVESTOR_NOT_FOUND: 'Investor tidak ditemukan',
    EMAIL_REQUIRED: 'Email harus diisi',
    PASSWORD_REQUIRED: 'Password harus diisi',
    NAME_REQUIRED: 'Nama harus diisi',
    AMOUNT_REQUIRED: 'Amount harus diisi',
    AMOUNT_INVALID: 'Amount harus lebih dari 0',
    AMOUNT_TOO_LARGE: 'Amount tidak boleh melebihi 10,000,000,000',
    AMOUNT_BELOW_MINIMUM: 'Minimum penarikan adalah Rp 100,000',
    FILE_REQUIRED: 'File bukti transfer harus diupload',
    FILE_TOO_LARGE: 'Ukuran file maksimal 5MB',
    INVALID_FILE_TYPE: 'File harus berupa gambar (JPG, JPEG, PNG)',
    EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
    TRANSACTION_NOT_FOUND: 'Transaksi tidak ditemukan',
    INVALID_STATUS: 'Status tidak valid',
    INVESTOR_HAS_TRANSACTIONS: 'Tidak dapat menghapus investor yang memiliki transaksi',
};

// Success Messages
const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login berhasil',
    REGISTER_SUCCESS: 'Register berhasil',
    INVEST_CREATED: 'Investasi berhasil dibuat',
    WITHDRAWAL_CREATED: 'Penarikan berhasil dibuat',
    WITHDRAWAL_UPDATED: 'Bukti transfer berhasil diupload',
    STATUS_UPDATED: 'Status berhasil diubah',
    INVESTOR_DELETED: 'Investor berhasil dihapus',
    USER_CREATED: 'User berhasil dibuat',
    USER_UPDATED: 'User berhasil diupdate',
    USER_DELETED: 'User berhasil dihapus',
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

// Cloudinary Configuration
const CLOUDINARY = {
    FOLDER: 'investment-proofs',
    RESOURCE_TYPE: 'image',
    FORMAT: 'jpg',
};

module.exports = {
    BUSINESS,
    STATUS,
    STATUS_DISPLAY,
    ROLE,
    TRANSACTION_TYPE,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    HTTP_STATUS,
    CLOUDINARY,
};
