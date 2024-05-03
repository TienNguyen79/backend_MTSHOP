import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constant/http.status";

export function success(data) {
  return { results: data };
}

export function badRequet() {
  return { results: `bad requet` };
}

export function error(data, description) {
  return {
    results: data,
    description: description,
  };
}

export function created() {
  return { results: `create successfully!` };
}
