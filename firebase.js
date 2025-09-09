{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // Import the functions you need from the SDKs you need\
import \{ initializeApp \} from "firebase/app";\
import \{ getAnalytics \} from "firebase/analytics";\
// TODO: Add SDKs for Firebase products that you want to use\
// https://firebase.google.com/docs/web/setup#available-libraries\
\
// Your web app's Firebase configuration\
// For Firebase JS SDK v7.20.0 and later, measurementId is optional\
const firebaseConfig = \{\
  apiKey: "AIzaSyDjMn8YmRDhtrucCXbO61eNnuk_OwpSJlE",\
  authDomain: "prisma-app-d16a1.firebaseapp.com",\
  projectId: "prisma-app-d16a1",\
  storageBucket: "prisma-app-d16a1.firebasestorage.app",\
  messagingSenderId: "855597788113",\
  appId: "1:855597788113:web:211fc0238c7d5ff8174ef0",\
  measurementId: "G-FM9X9W6NW1"\
\};\
\
// Initialize Firebase\
const app = initializeApp(firebaseConfig);\
const analytics = getAnalytics(app);}