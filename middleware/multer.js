import multer from 'multer'

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
       
        cb(null, './local/')
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        const uniqueSuffix = Date.now() 
        cb(null, `${uniqueSuffix}-${file.originalname}.${ext}` )
    }
})

const imagefilter = (req, file, cb) => {
    if(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg'  ){
        cb(null, true)
    }else{
        cb(new Error('only image files are allowed'))
    }
}

const uploadImage = multer({
     storage: multerStorage,
});

export default uploadImage