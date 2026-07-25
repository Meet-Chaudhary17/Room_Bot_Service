import prisma from "./prisma.js";

export async function connectDB(){
    try{
        await prisma.$connect();
        console.log("✅ PostgreSQL connected successfully");
    }catch(error){
        console.error("❌ Database connection failed");
        console.error(error);
        process.exit(1);
    }
}