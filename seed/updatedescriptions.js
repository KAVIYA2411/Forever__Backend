// ─────────────────────────────────────────────────────────────
//  Forever – BULLETPROOF Seed Script
//  1. Deletes ALL existing products from MongoDB
//  2. Re-seeds all 52 products with EXACT image-to-name mapping
//     taken directly from assets.js
//
//  Place at:  backend/seed/seedProducts.js
//  Run with:  node seed/seedProducts.js
// ─────────────────────────────────────────────────────────────

import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imagesDir = path.join(__dirname, 'images')

// ── Cloudinary ────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

// ── MongoDB ───────────────────────────────────────────────────
await mongoose.connect(process.env.MONGODB_URI)
console.log('✅ MongoDB connected\n')

const productSchema = new mongoose.Schema({
    name:        String,
    description: String,
    price:       Number,
    category:    String,
    subCategory: String,
    sizes:       Array,
    bestseller:  Boolean,
    image:       Array,
    date:        Number,
})
const Product = mongoose.models.product || mongoose.model('product', productSchema)

// ── Step 1: Delete ALL existing products ─────────────────────
const deleted = await Product.deleteMany({})
console.log(`🗑️  Deleted ${deleted.deletedCount} existing products\n`)

// ── Step 2: Description map per product name ─────────────────
const descMap = {
    "Women Round Neck Cotton Top": [
        "Soft and breathable round neck cotton top, perfect for casual everyday wear. Its relaxed fit pairs well with jeans, skirts, or trousers.",
        "Stay comfortable and stylish in this lightweight round neck cotton top. Versatile enough to dress up or down for any occasion.",
        "A wardrobe essential for every woman — flattering fit with superior comfort, ideal for both work and weekend wear.",
        "Crafted from premium cotton, this round neck top is soft against the skin and keeps you cool throughout the day.",
    ],
    "Women Palazzo Pants with Waist Belt": [
        "Elegant wide-leg palazzo pants with a matching waist belt for a polished look. Flowy fabric drapes beautifully for all-day comfort.",
        "Stylish palazzo pants with a flattering high-waist design and belt detail. Perfect for casual outings and semi-formal occasions.",
    ],
    "Women Zip-Front Relaxed Fit Jacket": [
        "Stay warm and stylish with this relaxed fit zip-front jacket. Comfortable oversized silhouette, ideal for layering in cooler months.",
        "A versatile zip-front jacket for effortless style. Relaxed fit offers freedom of movement while keeping you cozy on chilly days.",
        "Chic zip-front jacket that combines comfort and fashion. Perfect for layering over tops or dresses during the winter season.",
        "Elevate your winter wardrobe with this relaxed fit jacket. Easy to wear and style for any casual occasion.",
    ],
    "Men Round Neck Pure Cotton T-shirt": [
        "A classic round neck pure cotton T-shirt built for everyday comfort. Regular fit with durable stitching that holds shape wash after wash.",
        "Stay fresh in this pure cotton round neck T-shirt. Lightweight and breathable — perfect for casual wear, gym, or lounging.",
        "100% pure cotton round neck T-shirt offering superior softness and breathability. A timeless wardrobe essential for every man.",
        "High-quality pure cotton T-shirt that feels great against the skin. Pairs perfectly with jeans or chinos for a clean casual look.",
        "Simple, comfortable, and versatile — this pure cotton round neck T-shirt is a must-have everyday staple.",
    ],
    "Men Tapered Fit Flat-Front Trousers": [
        "Sharp and modern tapered fit flat-front trousers with a clean, streamlined silhouette. Slight stretch for all-day ease of movement.",
        "Wardrobe must-have flat-front tapered trousers. Perfect for office or smart casual, pairing well with shirts, polos, or tees.",
        "Sleek tapered fit trousers with a polished flat-front design. The tapered leg adds a contemporary edge to any outfit.",
    ],
    "Men Slim Fit Relaxed Denim Jacket": [
        "A classic slim fit denim jacket that never goes out of style. Button-front closure with chest pockets for a rugged refined look.",
        "Stay cool and layered with this slim fit denim jacket. Durable denim fabric with a comfortable fit for any casual outfit.",
        "Iconic slim fit denim jacket — a wardrobe essential. Wear over T-shirts or hoodies for effortless cool style.",
        "Relaxed fit denim jacket that pairs perfectly with chinos, joggers, or jeans for a smart casual look.",
    ],
    "Men Printed Plain Cotton Shirt": [
        "Smart printed cotton shirt that blends casual and semi-formal styles. Regular fit with clean collar and button-down front.",
        "Stand out with this stylish printed plain cotton shirt. Crafted for all-day comfort — great for office, outings, or brunches.",
    ],
    "Girls Round Neck Cotton Top": [
        "Adorable and comfortable round neck cotton top for girls. Soft breathable fabric gentle on skin — perfect for school or play.",
        "Keep your little one stylish in this round neck cotton top. Easy to wash and designed to last through active play.",
        "Fun and versatile round neck top for girls, crafted from pure cotton for maximum comfort in vibrant colours.",
        "Soft, durable, and easy to style — this girls' cotton top pairs well with jeans, shorts, or skirts.",
        "Lightweight and breathable round neck top designed for active girls who love to move. Comfortable all day long.",
    ],
    "Boy Round Neck Pure Cotton T-shirt": [
        "Durable and comfortable round neck pure cotton T-shirt for boys. Designed for active kids needing freedom of movement.",
        "Keep your boy looking fresh in this pure cotton round neck T-shirt. Soft on skin, perfect for school, sports, or casual wear.",
        "Pure cotton round neck T-shirt crafted for all-day comfort. Pairs well with shorts, jeans, or track pants.",
        "Soft, breathable, and built to last — 100% pure cotton T-shirt. A reliable everyday essential for growing kids.",
        "A wardrobe staple for every boy — great comfort and neat fit. Ideal for casual outings, school, or active play.",
    ],
    "Kid Tapered Slim Fit Trouser": [
        "Comfortable and stylish tapered slim fit trousers for kids. Soft durable fabric that allows free movement during play.",
        "Neat and modern slim fit trousers for kids — perfect for school, outings, or casual wear with any top.",
        "Smart wardrobe essential for kids — easy to wear and maintain, keeping your child comfortable and well-dressed.",
        "Tapered trousers designed for active kids — slim fit gives a polished look while soft fabric ensures all-day ease.",
    ],
}

const usageCount = {}
const getDescription = (name) => {
    const options = descMap[name] || [`Premium quality ${name.toLowerCase()} crafted for style and everyday comfort.`]
    if (!usageCount[name]) usageCount[name] = 0
    return options[usageCount[name]++ % options.length]
}

// ── Step 3: EXACT product list from assets.js ─────────────────
// image filenames are locked to each product — cannot be wrong
const products = [
    { name:"Women Round Neck Cotton Top",        category:"Women", subCategory:"Topwear",    price:100, sizes:["S","M","L"],          bestseller:true,  date:1716634345448, images:["p_img1.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:200, sizes:["M","L","XL"],         bestseller:true,  date:1716621345448, images:["p_img2_1.png","p_img2_2.png","p_img2_3.png","p_img2_4.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:220, sizes:["S","L","XL"],         bestseller:true,  date:1716234545448, images:["p_img3.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:110, sizes:["S","M","XXL"],        bestseller:true,  date:1716621345448, images:["p_img4.png"] },
    { name:"Women Round Neck Cotton Top",        category:"Women", subCategory:"Topwear",    price:130, sizes:["M","L","XL"],         bestseller:true,  date:1716622345448, images:["p_img5.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:140, sizes:["S","L","XL"],         bestseller:true,  date:1716623423448, images:["p_img6.png"] },
    { name:"Men Tapered Fit Flat-Front Trousers",category:"Men",   subCategory:"Bottomwear", price:190, sizes:["S","L","XL"],         bestseller:false, date:1716621542448, images:["p_img7.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:140, sizes:["S","M","L","XL"],     bestseller:false, date:1716622345448, images:["p_img8.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:100, sizes:["M","L","XL"],         bestseller:false, date:1716621235448, images:["p_img9.png"] },
    { name:"Men Tapered Fit Flat-Front Trousers",category:"Men",   subCategory:"Bottomwear", price:110, sizes:["S","L","XL"],         bestseller:false, date:1716622235448, images:["p_img10.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:120, sizes:["S","M","L"],          bestseller:false, date:1716623345448, images:["p_img11.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:150, sizes:["S","M","L","XL"],     bestseller:false, date:1716624445448, images:["p_img12.png"] },
    { name:"Women Round Neck Cotton Top",        category:"Women", subCategory:"Topwear",    price:130, sizes:["S","M","L","XL"],     bestseller:false, date:1716625545448, images:["p_img13.png"] },
    { name:"Boy Round Neck Pure Cotton T-shirt", category:"Kids",  subCategory:"Topwear",    price:160, sizes:["S","M","L","XL"],     bestseller:false, date:1716626645448, images:["p_img14.png"] },
    { name:"Men Tapered Fit Flat-Front Trousers",category:"Men",   subCategory:"Bottomwear", price:140, sizes:["S","M","L","XL"],     bestseller:false, date:1716627745448, images:["p_img15.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:170, sizes:["S","M","L","XL"],     bestseller:false, date:1716628845448, images:["p_img16.png"] },
    { name:"Men Tapered Fit Flat-Front Trousers",category:"Men",   subCategory:"Bottomwear", price:150, sizes:["S","M","L","XL"],     bestseller:false, date:1716629945448, images:["p_img17.png"] },
    { name:"Boy Round Neck Pure Cotton T-shirt", category:"Kids",  subCategory:"Topwear",    price:180, sizes:["S","M","L","XL"],     bestseller:false, date:1716631045448, images:["p_img18.png"] },
    { name:"Boy Round Neck Pure Cotton T-shirt", category:"Kids",  subCategory:"Topwear",    price:160, sizes:["S","M","L","XL"],     bestseller:false, date:1716632145448, images:["p_img19.png"] },
    { name:"Women Palazzo Pants with Waist Belt",category:"Women", subCategory:"Bottomwear", price:190, sizes:["S","M","L","XL"],     bestseller:false, date:1716633245448, images:["p_img20.png"] },
    { name:"Women Zip-Front Relaxed Fit Jacket", category:"Women", subCategory:"Winterwear", price:170, sizes:["S","M","L","XL"],     bestseller:false, date:1716634345448, images:["p_img21.png"] },
    { name:"Women Palazzo Pants with Waist Belt",category:"Women", subCategory:"Bottomwear", price:200, sizes:["S","M","L","XL"],     bestseller:false, date:1716635445448, images:["p_img22.png"] },
    { name:"Boy Round Neck Pure Cotton T-shirt", category:"Kids",  subCategory:"Topwear",    price:180, sizes:["S","M","L","XL"],     bestseller:false, date:1716636545448, images:["p_img23.png"] },
    { name:"Boy Round Neck Pure Cotton T-shirt", category:"Kids",  subCategory:"Topwear",    price:210, sizes:["S","M","L","XL"],     bestseller:false, date:1716637645448, images:["p_img24.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:190, sizes:["S","M","L","XL"],     bestseller:false, date:1716638745448, images:["p_img25.png"] },
    { name:"Women Zip-Front Relaxed Fit Jacket", category:"Women", subCategory:"Winterwear", price:220, sizes:["S","M","L","XL"],     bestseller:false, date:1716639845448, images:["p_img26.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:200, sizes:["S","M","L","XL"],     bestseller:false, date:1716640945448, images:["p_img27.png"] },
    { name:"Men Slim Fit Relaxed Denim Jacket",  category:"Men",   subCategory:"Winterwear", price:230, sizes:["S","M","L","XL"],     bestseller:false, date:1716642045448, images:["p_img28.png"] },
    { name:"Women Round Neck Cotton Top",        category:"Women", subCategory:"Topwear",    price:210, sizes:["S","M","L","XL"],     bestseller:false, date:1716643145448, images:["p_img29.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:240, sizes:["S","M","L","XL"],     bestseller:false, date:1716644245448, images:["p_img30.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:220, sizes:["S","M","L","XL"],     bestseller:false, date:1716645345448, images:["p_img31.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:250, sizes:["S","M","L","XL"],     bestseller:false, date:1716646445448, images:["p_img32.png"] },
    { name:"Girls Round Neck Cotton Top",        category:"Kids",  subCategory:"Topwear",    price:230, sizes:["S","M","L","XL"],     bestseller:false, date:1716647545448, images:["p_img33.png"] },
    { name:"Women Round Neck Cotton Top",        category:"Women", subCategory:"Topwear",    price:260, sizes:["S","M","L","XL"],     bestseller:false, date:1716648645448, images:["p_img34.png"] },
    { name:"Women Zip-Front Relaxed Fit Jacket", category:"Women", subCategory:"Winterwear", price:240, sizes:["S","M","L","XL"],     bestseller:false, date:1716649745448, images:["p_img35.png"] },
    { name:"Women Zip-Front Relaxed Fit Jacket", category:"Women", subCategory:"Winterwear", price:270, sizes:["S","M","L","XL"],     bestseller:false, date:1716650845448, images:["p_img36.png"] },
    { name:"Women Round Neck Cotton Top",        category:"Women", subCategory:"Topwear",    price:250, sizes:["S","M","L","XL"],     bestseller:false, date:1716651945448, images:["p_img37.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:280, sizes:["S","M","L","XL"],     bestseller:false, date:1716653045448, images:["p_img38.png"] },
    { name:"Men Printed Plain Cotton Shirt",     category:"Men",   subCategory:"Topwear",    price:260, sizes:["S","M","L","XL"],     bestseller:false, date:1716654145448, images:["p_img39.png"] },
    { name:"Men Slim Fit Relaxed Denim Jacket",  category:"Men",   subCategory:"Winterwear", price:290, sizes:["S","M","L","XL"],     bestseller:false, date:1716655245448, images:["p_img40.png"] },
    { name:"Men Round Neck Pure Cotton T-shirt", category:"Men",   subCategory:"Topwear",    price:270, sizes:["S","M","L","XL"],     bestseller:false, date:1716656345448, images:["p_img41.png"] },
    { name:"Boy Round Neck Pure Cotton T-shirt", category:"Kids",  subCategory:"Topwear",    price:300, sizes:["S","M","L","XL"],     bestseller:false, date:1716657445448, images:["p_img42.png"] },
    { name:"Kid Tapered Slim Fit Trouser",       category:"Kids",  subCategory:"Bottomwear", price:280, sizes:["S","M","L","XL"],     bestseller:false, date:1716658545448, images:["p_img43.png"] },
    { name:"Women Zip-Front Relaxed Fit Jacket", category:"Women", subCategory:"Winterwear", price:310, sizes:["S","M","L","XL"],     bestseller:false, date:1716659645448, images:["p_img44.png"] },
    { name:"Men Slim Fit Relaxed Denim Jacket",  category:"Men",   subCategory:"Winterwear", price:290, sizes:["S","M","L","XL"],     bestseller:false, date:1716660745448, images:["p_img45.png"] },
    { name:"Men Slim Fit Relaxed Denim Jacket",  category:"Men",   subCategory:"Winterwear", price:320, sizes:["S","M","L","XL"],     bestseller:false, date:1716661845448, images:["p_img46.png"] },
    { name:"Kid Tapered Slim Fit Trouser",       category:"Kids",  subCategory:"Bottomwear", price:300, sizes:["S","M","L","XL"],     bestseller:false, date:1716662945448, images:["p_img47.png"] },
    { name:"Men Slim Fit Relaxed Denim Jacket",  category:"Men",   subCategory:"Winterwear", price:330, sizes:["S","M","L","XL"],     bestseller:false, date:1716664045448, images:["p_img48.png"] },
    { name:"Kid Tapered Slim Fit Trouser",       category:"Kids",  subCategory:"Bottomwear", price:310, sizes:["S","M","L","XL"],     bestseller:false, date:1716665145448, images:["p_img49.png"] },
    { name:"Kid Tapered Slim Fit Trouser",       category:"Kids",  subCategory:"Bottomwear", price:340, sizes:["S","M","L","XL"],     bestseller:false, date:1716666245448, images:["p_img50.png"] },
    { name:"Women Zip-Front Relaxed Fit Jacket", category:"Women", subCategory:"Winterwear", price:320, sizes:["S","M","L","XL"],     bestseller:false, date:1716667345448, images:["p_img51.png"] },
    { name:"Men Slim Fit Relaxed Denim Jacket",  category:"Men",   subCategory:"Winterwear", price:350, sizes:["S","M","L","XL"],     bestseller:false, date:1716668445448, images:["p_img52.png"] },
]

// ── Step 4: Upload & Save ─────────────────────────────────────
let success = 0, fail = 0

for (const product of products) {
    try {
        process.stdout.write(`⏳ [${String(success + fail + 1).padStart(2,'0')}/52] ${product.name} (${product.images[0]}) ... `)
        const imageUrls = []

        for (const imageFile of product.images) {
            const imagePath = path.join(imagesDir, imageFile)
            if (!fs.existsSync(imagePath)) {
                console.log(`❌ MISSING FILE: ${imageFile}`)
                break
            }
            const result = await cloudinary.uploader.upload(imagePath, {
                resource_type: 'image',
                folder: 'forever-products',
                public_id: `forever-products/${imageFile.replace('.png','')}`,
                overwrite: true,
            })
            imageUrls.push(result.secure_url)
        }

        if (imageUrls.length === 0) {
            console.log('❌ Skipped — no images')
            fail++
            continue
        }

        await new Product({
            name:        product.name,
            description: getDescription(product.name),
            price:       product.price,
            category:    product.category,
            subCategory: product.subCategory,
            sizes:       product.sizes,
            bestseller:  product.bestseller,
            image:       imageUrls,
            date:        product.date,
        }).save()

        console.log('✅')
        success++

    } catch (err) {
        console.log(`❌ Error: ${err.message}`)
        fail++
    }
}

console.log('\n══════════════════════════════════════')
console.log(`✅ Seeded:  ${success}/52 products`)
console.log(`❌ Failed:  ${fail}/52 products`)
console.log('══════════════════════════════════════')

await mongoose.disconnect()
console.log('👋 Done! Refresh your frontend now.')