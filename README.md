# Hướng dẫn sử dụng

- `npm install`
- `npm start`

Nhớ thay tên database ở file /config/config.json và /config/connectDB.js
**_Tạo Modal và migration:_**
cd vào src
npx sequelize-cli model:generate --name User --attributes userName:string,email:string,password:string

**_Để chuyển model lên phpadmin:_**
cd vào src
npx sequelize-cli db:migrate

**_Seeder_**

- tạo 1 file seed : npx sequelize-cli seed:generate --name ten_file_seed
- Seed all: npx sequelize-cli db:seed:all
- Seed riêng file npx sequelize db:seed --seed ten_file1_seed.js ten_file2_seed.js ....
