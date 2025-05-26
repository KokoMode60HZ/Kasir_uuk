const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const authController = {

    getRegister: (req, res) => {
        res.render('register', {
            userRole: req.session.user?.role,
            user: req.session.user,
            currentPath: '/auth/register'
        });
    },

    getLogin: (req, res) => {
        res.render('login', {
            userRole: req.session.user?.role,
            user: req.session.user,
            currentPath: '/auth/login'
        });
    },      register: async (req, res) => {
        try {
            console.log('Register request body:', req.body);

            const { nama, alamat, telepon, username, password, role } = req.body;

            const existingUser = await User.findOne({ 'akun.username': username });
            if (existingUser) {
                console.log('Username sudah ada');
                return res.render('register', { 
                    error: 'Username sudah digunakan',
                    currentPath: '/auth/register'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                akun: {
                    username,
                    password: hashedPassword,
                    role: role || 'pelanggan' 
                },
                nama,
                alamat,
                telepon
            });

            await newUser.save();
            console.log('User berhasil disimpan');

            return res.redirect('/auth/login?registered=true');

        } catch (error) {
            console.error('Error saat registrasi:', error);
            return res.render('register', {
                error: 'Terjadi kesalahan saat registrasi',
                currentPath: '/auth/register'
            });
        }
    },
   
    login: async (req, res) => {
        try {
            console.log('Login attempt:', req.body);

            const { username, password } = req.body;

            const user = await User.findOne({ "akun.username": username });
            console.log('Found user:', user);

            if (!user) {
                return res.render('login', {
                    error: "Username atau password salah",
                    currentPath: '/auth/login'
                });
            }

            const validPassword = await bcrypt.compare(password, user.akun.password);
            console.log('Password valid:', validPassword);

            if (!validPassword) {
                return res.render('login', {
                    error: "Username atau password salah",
                    currentPath: '/auth/login'
                });
            }

            req.session.user = {
                id: user._id,
                username: user.akun.username,
                role: user.akun.role
            };
            console.log('Session set:', req.session.user); 

            if (user.akun.role === "admin" || user.akun.role === "petugas") {
                return res.redirect("/produk");
            } else {
                return res.redirect("/produk/pelanggan");
            }

        } catch (error) {
            console.error('Login error:', error);
            return res.render('login', {
                error: "Terjadi kesalahan saat login",
                currentPath: '/auth/login'
            });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Gagal logout");
            }
            res.redirect("/auth/login");
        });
    }
}

module.exports = authController;