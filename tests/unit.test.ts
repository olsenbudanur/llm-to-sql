import { LLMToSQL } from "../src/llm-to-sql";
import { OpenAIChatApi } from "llm-api";
import { Sequelize } from "sequelize";
import { mocked } from "jest-mock";

//
// TODO: These test could be more comprehensive.
// there are many more edge cases that could be tested.

//
// Mock the libraries
jest.mock("llm-api");
const MockedOpenAIChatApi = mocked(OpenAIChatApi);
jest.mock("sequelize");
const MockedSequelize = mocked(Sequelize);

describe("LLMToSQL", () => {
    let llmToSQL: LLMToSQL;

    beforeEach(() => {
        //  
        // Create mock instances of llm-api and sequelize
        const mockLLMApi = new MockedOpenAIChatApi({});
        const mockSequelize = new MockedSequelize();

        //
        // Create an instance of LLMToSQL with the mock instances
        llmToSQL = new LLMToSQL({
            llmApi: mockLLMApi,
            sequelize: mockSequelize,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should change the system prompt", () => {
        const newSystemPrompt = "New system prompt";
        llmToSQL.changeSystemPrompt(newSystemPrompt);
        expect(llmToSQL["systemPrompt"]).toBe(newSystemPrompt);
    });

    it("should change the maximum number of trials", () => {
        const newMaxTrials = 5;
        llmToSQL.changeMaxTrials(newMaxTrials);
        expect(llmToSQL["MAX_TRIALS"]).toBe(newMaxTrials);
    });

    it("should fail to initiate", () => {
        expect(() => new LLMToSQL({})).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
        expect(() => new LLMToSQL({ sequelize: new MockedSequelize() })).toThrow("Either an llmApi instance or llmApi configs must be provided.");
        expect(() => new LLMToSQL({ sequelizeOptions: {}, sqlInfo: "" })).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
        expect(() => new LLMToSQL({ sequelize: new MockedSequelize(), sequelizeOptions: {} })).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
        expect(() => new LLMToSQL({ sequelize: new MockedSequelize(), sqlInfo: "" })).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
        expect(() => new LLMToSQL({ sequelizeOptions: {}, sqlInfo: "" })).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
        expect(() => new LLMToSQL({ sequelize: new MockedSequelize(), sequelizeOptions: {}, sqlInfo: "" })).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
        expect(() => new LLMToSQL({ llmApi: new MockedOpenAIChatApi({}) })).toThrow("Either an ORM instance, ORM configs or SQL information must be provided.");
    });

    it("should run the LLM model and return the SQL query", async () => {
        const userQuery = "SELECT * FROM users";
        const mockLLMApiResponse = {
            content: "SELECT * FROM users",
        };
        const mockSequelizeResponse = [{ id: 1, name: "John" }];
        (llmToSQL["sequelizeORM"] as any).query = jest.fn().mockResolvedValue(mockSequelizeResponse);
        llmToSQL["llmApi"].textCompletion = jest.fn().mockResolvedValue(mockLLMApiResponse);
        const result = await llmToSQL.run(userQuery, true);
        expect(result).toEqual({
                sqlQuery: mockLLMApiResponse.content,
                results: mockSequelizeResponse,
        });
        expect(llmToSQL["llmApi"].textCompletion).toHaveBeenCalledWith(expect.any(String), {
            systemMessage: llmToSQL["systemPrompt"],
        });
        expect((llmToSQL["sequelizeORM"] as any)?.query).toHaveBeenCalledWith(mockLLMApiResponse.content);
    });
});