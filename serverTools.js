
// check if JSON data already exists, insert if not exist
app.post('/jsonCheck',(req,res)=>{
	const {resto,address,city,province,country,postal,ratingtotal,latlng,price,rating,} = req.body;
	db('restaurants')
	.where('resto',resto)
	.first()
	.then(existingName =>{
		if(!existingName){
			return db('restaurants')
				.insert({
						resto: resto,
		      	address: address,
		      	city: city,
		      	province: province,
		      	country: country,
		      	postal: postal,
		      	ratingtotal: ratingtotal,
		      	latlng: latlng,
		      	price: price,
		      	rating: rating,
				})
				.then(()=>{
					console.log(`Inserted ${resto} into table`);
				}).catch(error =>{
					console.log("Error inserting");
				})
			}else{
				console.log(`${resto} already exists`);
			}
	})
	.catch(err=>{		
		console.error(`Error checking for ${resto}: ${err}`);
	});
})


//write a json file
app.post('/makejson',(req,res)=>{
	let data = req.body;
	fs.writeFile('../restoFile.json', JSON.stringify(data), (err) => {
    if (err){ return console.log('Error writing json file:', err);}
	})
	.then(data=>{

	})
	.catch(err => res.status(500).json(err))
})
