# CoCoHelper

Group Members:

Mercado, Bruce Berroya

Joyo, John Carlo Acosta

Villarica, Matthew James Del Pilar

## Dependencies
[Node.js v18.17.1](https://nodejs.org/en)

[MongoDB 5.0.9 Community](https://www.mongodb.com/try/download/community-edition/releases/archive)

## Installation and Set-Up

1. Clone the repository

```bash
git clone https://github.com/antimatter07/CoCoHelper.git
```
2. Install dependencies 
```bash
npm install
```
3. If needed, replace the mongoURI const in `index.js`with the the MongoDB Compass connection string locally provided
```
 // connection string from Atlas using 'Copy connection string' : mongodb://localhost:27017/
 const mongoURI = 'mongodb://127.0.0.1:27017/CoCoDB';
```
## Running the App
1. Run the web app locally
```
node index.js
```
2. Open the web app on `localhost:3000`

## Screenshots

Log in
![log-in-coco](https://github.com/antimatter07/CoCoHelper/assets/53604004/c06e8958-2c53-45e4-9147-0df31235e258)

Add Drink
<img width="959" alt="cocowebappadd" src="https://github.com/antimatter07/CoCoHelper/assets/53604004/5a1ea039-f38d-4dea-885c-72a1b588f6db">

Cart View
![cococart](https://github.com/antimatter07/CoCoHelper/assets/53604004/bd15ab6f-8048-4a2e-998d-be0ce0477778)

Orders 
![ordercoco](https://github.com/antimatter07/CoCoHelper/assets/53604004/82709b2e-17ce-48ff-85ab-931cb1cfc4b5)
