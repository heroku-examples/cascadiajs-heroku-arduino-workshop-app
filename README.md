# heroku-arduino-demo-client

A Node.js application using [@arduino/arduino-iot-cloud](https://www.npmjs.com/package/@arduino/arduino-iot-client) and the new [Explore IoT](https://explore-iot.arduino.cc/) on Heroku.

## Requirements

On the Arduino IoT Cloud, [Create a new API and download the resulting Client ID and Secret](https://create.arduino.cc/iot/things) and set them as environment variables:

```sh
export CLIENT_ID="...."
export CLIENT_SECRET="...."
```

## Deployment

1. Create an Heroku application:

``` sh
heroku create <my-app-name>
```

2. Set the Arduino Client and Secret IDs:

``` sh
heroku config:set CLIENT_ID="...."
heroku config:set CLIENT_SECRET="..."
```

3. Deploy to Heroku:

``` sh
git push heroku main
```

4. Open Application:

``` sh
heroku open
```
