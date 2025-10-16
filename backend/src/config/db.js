import mongoose from 'mongoose';


const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    }catch(error){
        console.error("MongoDB connection error: ",error);
        console.log("Server will continue without database connection for testing purposes");
        // Don't exit the process - allow server to run for testing
        // process.exit(1);
    }
};

export default connectDB;