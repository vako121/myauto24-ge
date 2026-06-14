# განცხადებების მასობრივი იმპორტი

ეს იმპორტერი განკუთვნილია იმ წყაროებისთვის, რომლებზეც გაქვს ნებართვა: საკუთარი ექსპორტი, პარტნიორის API/ფაილი ან საჯაროდ ხელმისაწვდომი feed, რომლის წესებიც იმპორტს უშვებს. სხვა საიტის უნებართვო scraping-მა შეიძლება დაარღვიოს მათი პირობები ან საავტორო უფლებები.

## გაშვება

1. მოამზადე JSON ან CSV ფაილი/URL საჭირო ველებით.
2. ჯერ შეამოწმე ვალიდაცია:

```bash
npm run import:listings -- --source ./listings.json --dry-run
```

3. რეალური იმპორტისთვის გამოიყენე Supabase service role key:

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
npm run import:listings -- --source ./listings.json --batch-size 500
```

HTTP(S) წყაროსთვის:

```bash
npm run import:listings -- --source https://partner.example/feed.json --dry-run
```

Bearer token-ის საჭიროებისას:

```bash
npm run import:listings -- --source https://partner.example/feed.json --token YOUR_TOKEN --dry-run
```

## საჭირო ველები

`make`, `model`, `year`, `price`, `mileage`, `fuel`, `transmission`, `city`, `engine`, `drive`, `color`, `description`, `image_url`, `user_id`.

არასავალდებულო ველები: `contact_name`, `contact_phone`, `vip` (`super`, `vip`, `color`).

## JSON მაგალითი

```json
[
  {
    "make": "Toyota",
    "model": "Prius",
    "year": 2018,
    "price": 12500,
    "mileage": 94000,
    "fuel": "ჰიბრიდი",
    "transmission": "ავტომატიკა",
    "city": "თბილისი",
    "engine": "1.8L",
    "drive": "წინა",
    "color": "თეთრი",
    "description": "შემოწმებული ავტომობილი პარტნიორის ბაზიდან.",
    "image_url": "https://example.com/prius.jpg",
    "user_id": "00000000-0000-0000-0000-000000000000",
    "contact_name": "იმპორტი",
    "contact_phone": "+995555000000"
  }
]
```

## CSV მაგალითი

```csv
make,model,year,price,mileage,fuel,transmission,city,engine,drive,color,description,image_url,user_id,contact_name,contact_phone
Toyota,Prius,2018,12500,94000,ჰიბრიდი,ავტომატიკა,თბილისი,1.8L,წინა,თეთრი,შემოწმებული ავტომობილი,https://example.com/prius.jpg,00000000-0000-0000-0000-000000000000,იმპორტი,+995555000000
```
