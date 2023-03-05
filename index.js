const client = require("prom-client");
const express = require("express");
const Acuparse = require("acuparse-api/dist").default;

const prefix = "acuparse_";

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;

let rainValue = 0;

const api = new Acuparse(process.env.ENDPOINT);
const register = new Registry();
collectDefaultMetrics({ register, prefix });

const tempGauge = new client.Gauge({
  name: `${prefix}temperature`,
  help: "The current temperature, deg F",
});

const feelsLikeGauge = new client.Gauge({
  name: `${prefix}feels_like`,
  help: "The current feels like temperature, deg F",
});

const dewPointGauge = new client.Gauge({
  name: `${prefix}dew_point`,
  help: "The current dew point, deg F",
});

const relativeHumidity = new client.Gauge({
  name: `${prefix}relative_humidity`,
  help: "The current dew point, deg F",
});

const windSpeed = new client.Gauge({
  name: `${prefix}wind_speed`,
  help: "The current wind speed, in mph",
});

const windDir = new client.Gauge({
  name: `${prefix}wind_dir`,
  help: "The current wind direction, in deg",
});

const windGustSpeed = new client.Gauge({
  name: `${prefix}wind_gust_speed`,
  help: "The current wind gust, in mpg",
});

const windGustDir = new client.Gauge({
  name: `${prefix}wind_gust_dir`,
  help: "The current wind gust direction, in deg",
});

const pressure = new client.Gauge({
  name: `${prefix}pressure`,
  help: "The current pressure, in inHg",
});

const rain = new client.Counter({
  name: `${prefix}rain_accum`,
  help: "The current rain accumulation",
});

const moonAge = new client.Gauge({
  name: `${prefix}moon_age`,
  help: "The current moon age",
});

const moonIllumination = new client.Gauge({
  name: `${prefix}moon_illumination`,
  help: "The current moon illumination",
});

const lightIntensity = new client.Gauge({
  name: `${prefix}light_intensity`,
  help: "The current light intensity, in lux",
});

const lightTime = new client.Gauge({
  name: `${prefix}light_time`,
  help: "The amount of light today, in seconds",
});

const uv = new client.Gauge({
  name: `${prefix}uv`,
  help: "The UV index",
});

const lightning = new client.Counter({
  name: `${prefix}lightning_strikes`,
  help: "The amount of lightning strikes",
});

register.registerMetric(tempGauge);
register.registerMetric(feelsLikeGauge);
register.registerMetric(dewPointGauge);
register.registerMetric(relativeHumidity);
register.registerMetric(windSpeed);
register.registerMetric(windDir);
register.registerMetric(windGustSpeed);
register.registerMetric(windGustDir);
register.registerMetric(pressure);
register.registerMetric(rain);
register.registerMetric(moonAge);
register.registerMetric(moonIllumination);
register.registerMetric(lightIntensity);
register.registerMetric(lightTime);
register.registerMetric(uv);
register.registerMetric(lightning);

const prep = async () => {
  const data = await api.getMain("imperial");
  rainValue = data.rain.total;
  lightningValue = data.lightning.strikes;
};
prep();

setInterval(async () => {
  const data = await api.getMain("imperial");
  tempGauge.set(data.temp.temp || 0);
  feelsLikeGauge.set(data.temp.feelsLike || 0);
  dewPointGauge.set(data.temp.dewPoint || 0);
  relativeHumidity.set(data.relativeHumidity.relativeHumidity || 0);
  windSpeed.set(data.wind.speed || 0);
  windDir.set(data.wind.direction.deg || 0);
  windGustSpeed.set(data.windGust.speed || 0);
  windGustDir.set(data.windGust.direction.deg || 0);
  pressure.set(data.pressure.pressure || 0);
  rain.inc(data.rain.total - rainValue || 0);

  moonAge.set(data.moon.age);
  moonIllumination.set(data.moon.illumination);
  lightIntensity.set(data.light.intensity.intensity);
  lightTime.set(data.light.lightTime);
  uv.set(data.light.uv.uv);
  lightning.inc(lightningValue - data.lightning.strikes);

  rainValue = data.rain.total;
  lightningValue = data.lightning.strikes;
}, 5000);

const app = express();
app.get("/metrics", async (req, res) => {
  res.contentType("text/plain");
  res.send(await register.metrics());
});

app.listen(9081);
