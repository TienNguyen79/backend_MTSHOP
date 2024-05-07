import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constant/http.status";

export function success(data, rest) {
  return { results: data, ...rest };
}

export function badRequet() {
  return { results: `bad requet` };
}

export function error(description) {
  return {
    ms: description,
  };
}

export function created() {
  return { results: `create successfully!` };
}
