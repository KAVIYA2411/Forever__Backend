import mongoose from 'mongoose'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("MongoDB connected"))
    await mongoose.connect(process.env.MONGODB_URI)
}

export default connectDB