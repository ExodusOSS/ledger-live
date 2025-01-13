import axios from "@exodus/axios-replacement";
import { fetchTokens } from ".";

jest.mock("@exodus/axios-replacement");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("fetcher", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return data when fetched", async () => {
    const response = [{ myToken: { name: "myToken" } }];
    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: response }));
    const tokens = await fetchTokens("tokens.json");
    expect(tokens).toBe(response);
  });

  it("should throw error if fetch failed", async () => {
    mockedAxios.get.mockImplementation(() => Promise.reject({ message: "could not fetch" }));
    expect(async () => {
      await fetchTokens("tokens.json");
    }).rejects.toThrow();
  });
});
