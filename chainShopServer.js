let express=require('express');
let app=express();
app.use(express.json());
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
const port= process.env.PORT || 2411;
app.listen(port, ()=>console.log(`Node app listening on port ${port}!`));

let {allData}=require('./allData.js');
let fs=require('fs');
const { json } = require('express');
let fname='allData.json';

app.get("/shops/resetData",function(req, res){
    let data=JSON.stringify(allData);
    fs.writeFile(fname, data, function(err){
        if(err) res.status(404).send(err);
        else res.send("Data in file is reset");
    });
});


/***********for Shop *************/
app.get("/shops", (req, res)=>{
    fs.readFile(fname, 'utf-8', (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            res.send(allDataArr.shops);
        }
    })
})
app.post("/shops", (req, res)=>{
    let body=req.body;
    fs.readFile(fname, 'utf-8', (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            let maxid=allDataArr.shops.reduce((acc, curr)=>(curr.shopId>acc?curr.shopId:acc),0);
            let newid=maxid+1;
            let newShop={...body, shopId:newid};
            allDataArr.shops.push(newShop);
            let data1=JSON.stringify(allDataArr);
            fs.writeFile(fname, data1, (err)=>{
                if(err) res.status(404).send(err);
                else res.send(newShop);
            });
        }
    });
});



/***********for Products *************/
app.get("/products", (req, res)=>{
    fs.readFile(fname, 'utf-8', (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            res.send(allDataArr.products);
        }
    })
})

app.get("/products/:id", (req, res)=>{
    let id=+req.params.id;
    fs.readFile(fname, 'utf-8', (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            res.send(allDataArr.products.find(n=>n.productId===id));
        }
    })
})
app.post("/products", (req, res)=>{
    let body=req.body;
    fs.readFile(fname, 'utf-8', (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            let maxid=allDataArr.products.reduce((acc, curr)=>(curr.productId>acc?curr.productId:acc),0);
            let newid=maxid+1;
            let newProduct={...body, productId:newid};
            allDataArr.products.push(newProduct);
            let data1=JSON.stringify(allDataArr);
            fs.writeFile(fname, data1, (err)=>{
                if(err) res.status(404).send(err);
                else res.send(newProduct);
            });
        }
    });
});
app.put("/products/:id", (req, res)=>{
    let body=req.body;
    let id=+req.params.id;

    fs.readFile(fname, 'utf-8', (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            let index=allDataArr.products.findIndex(st=>st.productId===id);
            if(index>=0){
                let updatedProduct={...allDataArr.products[index], ...body};
                allDataArr.products[index]=updatedProduct;
                let data1=JSON.stringify(allDataArr);
                fs.writeFile(fname, data1, (err)=>{
                    if(err) res.status(404).send(err);
                    else res.send(updatedProduct);
                })
            }
            else res.status(404).send("No Product Found")
        }
    });
});

/*****************For Purchase ***************/
app.get('/purchases', (req, res)=>{
    let {products, shop, sort}=req.query;
    fs.readFile(fname,"utf-8", (err, data)=>{
        if(err)res.status(404).send(err);
        else {
            
            let allDataArr=JSON.parse(data);
            let prodList=products?products.split(','):[];
            let prods=allDataArr.products.filter(n=>prodList.includes(n.productName))
            let prodsIds=prods.map(n=>n.productId);

            let shopIds=(allDataArr.shops.findIndex(n=>n.name==shop))+1;

            let purchase=allDataArr.purchases;
            if(products)purchase=purchase.filter(n=>prodsIds.includes(n.productid));
            if(shop) purchase=purchase.filter(n=>n.shopId==shopIds);
            
            if(sort){
                if(sort=='QtyAsc') purchase=purchase.sort((a,b)=>a.quantity-b.quantity);
                else if(sort=='QtyDesc') purchase=purchase.sort((a,b)=>b.quantity-a.quantity);
                else if(sort=='ValueAsc') purchase=purchase.sort((a,b)=>a.quantity*a.price-b.quantity*b.price);
                else if(sort=='ValueDesc') purchase=purchase.sort((a,b)=>b.quantity*b.price-a.quantity*a.price);
            }
            res.send(purchase);
        }
    })
})
app.get('/purchases/shops/:id', (req, res)=>{
    let id=+req.params.id;
    fs.readFile(fname,"utf-8", (err, data)=>{
        if(err)res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            res.send(allDataArr.purchases.filter(n=>n.shopId===id));
        }
    })
})

app.get('/purchases/products/:id', (req, res)=>{
    let id=+req.params.id;
    fs.readFile(fname,"utf-8", (err, data)=>{
        if(err)res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            res.send(allDataArr.purchases.filter(n=>n.productid===id));
        }
    })
})

app.get('/totalPurchase/shop/:id', (req, res)=>{
    let id=+req.params.id;
    fs.readFile(fname, "utf-8", (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            let purchase=allDataArr.purchases;
            purchase=purchase.filter(n=>n.shopId==id);
            let maxid=allDataArr.products.reduce((acc, curr)=>(curr.productId>acc?curr.productId:acc),0);
            let i=1;
            let pur=[]
            for(i=1;i<=maxid;i++){
                let quantity=purchase.reduce((acc, curr)=>curr.productid==i?acc+curr.quantity:acc,0)
                // console.log(quantity)
                let x=purchase.find(n=>n.productid==i);
                let price=0;
                if(x) price=x.price;
                let pr={purchaseId:i,shopId:id, productid:i, quantity:quantity, price:price}
                pur.push(pr);
            }
            // console.log(pur)
            res.send(pur);
        }
    })
})

app.get('/totalPurchase/product/:id', (req, res)=>{
    let id=+req.params.id;
    fs.readFile(fname, "utf-8", (err, data)=>{
        if(err) res.status(404).send(err);
        else {
            let allDataArr=JSON.parse(data);
            let purchase=allDataArr.purchases;
            purchase=purchase.filter(n=>n.productid==id);
            let maxid=allDataArr.shops.reduce((acc, curr)=>(curr.shopId>acc?curr.shopId:acc),0);
            let i=1;
            let pur=[]
            for(i=1;i<=maxid;i++){
                let quantity=purchase.reduce((acc, curr)=>curr.shopId==i?acc+curr.quantity:acc,0)
                // console.log(quantity)
                let x=purchase.find(n=>n.shopId==i);
                let price=0;
                if(x) price=x.price;
                let pr={purchaseId:i,shopId:i, productid:id, quantity:quantity, price:price}
                pur.push(pr);
            }
            // console.log(pur)
            res.send(pur);
        }
    })
})