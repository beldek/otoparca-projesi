import express,{Request,Response} from 'express';
import User from '../models/User';


const router = express.Router();

router.post('/register',async(req:Request,res:Response)=>{

    try
    {
        const {name,email,password,role,phone}= req.body;

            
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı!' });
        }

        const newUser = new User({
            name,
            email,
            password, 
            role: role || 'customer',
            phone
        });

        await newUser.save();

        res.status(201).json({ message: 'Kayıt başarılı! Giriş yapabilirsiniz.' });
    }
    catch(error)
    {
        console.error('Kayıt Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });

    }

});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // 2. Şifreyi kontrol et (Şimdilik düz metin karşılaştırması)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Şifre hatalı!' });
    }

    // 3. Başarılı! Kullanıcı bilgilerini geri dön (Şifre hariç)
    // (İlerde buraya JWT Token ekleyeceğiz)
    res.status(200).json({
      message: 'Giriş Başarılı!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});



export default router;