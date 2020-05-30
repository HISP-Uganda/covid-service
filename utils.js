const _ = require("lodash");
const axios = require("axios");
const dotenv = require("dotenv");

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

exports.createDHIS2Auth = () => {
  const username = process.env.DHIS2_USER;
  const password = process.env.DHIS2_PASS;
  return { username, password };
};

exports.getDHIS2Url = () => {
  return process.env.DHIS2_URL;
};

exports.getAxios = async (url, params = {}) => {
  const username = process.env.DHIS2_USER;
  const password = process.env.DHIS2_PASS;
  const dhis2 = process.env.DHIS2_URL;
  return axios.get(dhis2 + url, {
    params,
    auth: { username, password },
  });
};

exports.postAxios = async (url, data) => {
  const username = process.env.DHIS2_USER;
  const password = process.env.DHIS2_PASS;
  const dhis2 = process.env.DHIS2_URL;

  return axios.post(dhis2 + url, data, {
    auth: { username, password },
  });
};

exports.convertYesNoUnKnown = (val, attributes, attribute) => {
  let items = attributes.map((a) => a);
  let foundIndex = items.findIndex((a) => attribute === a.id);
  switch (val) {
    case "Yes":
    case "yes":
    case 1:
    case true:
      items = items.splice(foundIndex, 1, { attribute, value: "Yes" });
      break;

    case "No":
    case "no":
    case 0:
    case false:
      items = items.splice(foundIndex, 1, { attribute, value: "No" });
      break;
  }

  return items;
};
