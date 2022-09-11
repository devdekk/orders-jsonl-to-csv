# orders-jsonl-to-csv

A Node.js Typescript app that fetches a jsonl file from the web,  
processes the data into a report and creates a CSV file to the root of the project. (out.csv)

An optional command line paramater (email) can also be provided.
This will simulate sending an email with the CSV attached to the desired email address
by providing a preview URL in the console once the app is run.
(somthing like this.. https://ethereal.email/message/Yx2tKTBgBufqhZ5NYx2tLUR08nemSH3UAAAAAe1tW3lz1lgKxUWa1osRLHs)

Follow these steps to get the app to run:

# install dependencies

$ npm run install

# run app

$ npm run report

# run app with mock email

$ npm run report --email=<youremail@gmail.com>
