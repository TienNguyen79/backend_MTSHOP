import { OK } from "../constant/http.status";
import { success } from "../results/handle.results";
import { testService } from "../services/test.Service";

const handleTest = async (req, res) => {
  let data = await testService();

  if (data) {
    return res.status(OK).json(success(data));
  }
};

export { handleTest };
