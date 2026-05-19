const lambda = require("../../../../../../src/sp/fluctuationAllowance/postMonthlyFluctuationAllowance/v1/1/app");
const assert = require("assert");

describe("SP Post Monthly Fluctuation Allowance API Lambda Test Suite", () => {
  beforeEach(() => {
    jest.mock("utils/api_response_utils");
    jest.mock("utils/common_utils");
    jest.mock("constants/customConstants");
    jest.mock("prismaORM/index");
    jest.mock("prismaORM/services/scenariosService");
    jest.mock("prismaORM/services/simulationService");
    jest.mock("prismaORM/services/monthlyFaService");
    jest.mock("prismaORM/services/scenarioStepStatusService");
  });
  afterEach(() => {
    delete process.env.VALIDATION;
  });

  it("Unit Test Case 1: The API should return success message with a 200 status code.", async () => {
    console.log(
      "*****************Unit Test Case 1: The API should return success message with a 200 status code.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const expected = {
      message: "Successfully updated data.",
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 200);
    assert.deepEqual(JSON.parse(result.body), expected);
  });

  it("Unit Test Case 2: The API should return success with 0 FA value.", async () => {
    console.log(
      "*****************Unit Test Case 2: The API should return success with 0 FA value.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 0 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 200);
    assert.deepEqual(JSON.parse(result.body), {
      message: "Successfully updated data.",
    });
  });

  it("Unit Test Case 3: The API should return 200 and NOT update scenario status when scenario is already In Progress.", async () => {
    console.log(
      "*****************Unit Test Case 3: The API should return 200 and NOT update scenario status when scenario is already In Progress.*****************"
    );
    process.env.VALIDATION = "alreadyinprogress";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 32 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 200);
    assert.deepEqual(JSON.parse(result.body), {
      message: "Successfully updated data.",
    });
  });

  it("Unit Test Case 4: The API should return validation error with a 400 status code when accessed with an empty event.", async () => {
    console.log(
      "*****************Unit Test Case 4: The API should return validation error with a 400 status code when accessed with an empty event.*****************"
    );
    const event = {};
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    const response = JSON.parse(result.body);
    assert.deepEqual(response, {
      errorMessage: ["ValidationError: Request body cannot be empty."],
    });
  });

  it("Unit Test Case 5: The API should return validation error with a 400 status code - Scenario doesn't exist.", async () => {
    console.log(
      "*****************Unit Test Case 5: The API should return validation error with a 400 status code - Scenario doesn't exist.*****************"
    );
    process.env.VALIDATION = "scenarionotfound";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: ["ValidationError: Scenario doesn't exist."],
    });
  });

  it("Unit Test Case 6: The API should return a validation error (400) - scenarioId is missing.", async () => {
    console.log(
      "*****************Unit Test Case 6: The API should return a validation error with a 400 status code - scenarioId is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: scenarioId is required and must be a uuid.",
      ],
    });
  });

  it("Unit Test Case 7: The API should return a validation error (400) - invalid scenarioId.", async () => {
    console.log(
      "*****************Unit Test Case 7: The API should return a validation error with a 400 status code - invalid scenarioId.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "invalid_uuid",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: scenarioId is required and must be a uuid.",
      ],
    });
  });

  it("Unit Test Case 8: The API should return a validation error (400) - userEmail is missing.", async () => {
    console.log(
      "*****************Unit Test Case 8: The API should return a validation error with a 400 status code - userEmail is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: userEmail is required and must be a string.",
      ],
    });
  });

  it("Unit Test Case 9: The API should return a validation error (400) - invalid userEmail.", async () => {
    console.log(
      "*****************Unit Test Case 9: The API should return a validation error with a 400 status code - invalid userEmail.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "not-an-email",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: ["ValidationError: Invalid userEmail."],
    });
  });

  it("Unit Test Case 10: The API should return a validation error (400) - applyTo is missing.", async () => {
    console.log(
      "*****************Unit Test Case 10: The API should return a validation error with a 400 status code - applyTo is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: applyTo is required and must be a valid string.",
      ],
    });
  });

  it("Unit Test Case 11: The API should return a validation error (400) - invalid applyTo.", async () => {
    console.log(
      "*****************Unit Test Case 11: The API should return a validation error with a 400 status code - invalid applyTo.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "SOME_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: applyTo is required and must be a valid string.",
      ],
    });
  });

  it("Unit Test Case 12: The API should return a validation error (400) - mode is missing.", async () => {
    console.log(
      "*****************Unit Test Case 12: The API should return a validation error with a 400 status code - mode is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: mode is required and must be a valid string.",
      ],
    });
  });

  it("Unit Test Case 13: The API should return a validation error (400) - invalid mode.", async () => {
    console.log(
      "*****************Unit Test Case 13: The API should return a validation error with a 400 status code - invalid mode.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "SOME_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: mode is required and must be a valid string.",
      ],
    });
  });

  it("Unit Test Case 14: The API should return a validation error (400) - data is missing.", async () => {
    console.log(
      "*****************Unit Test Case 14: The API should return a validation error with a 400 status code - data is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: data is required and must be an object.",
      ],
    });
  });

  it("Unit Test Case 15: The API should return a validation error (400) - fa is missing.", async () => {
    console.log(
      "*****************Unit Test Case 15: The API should return a validation error with a 400 status code - fa is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {},
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: fa is required and must be an object.",
      ],
    });
  });

  it("Unit Test Case 16: The API should return a validation error (400) - value is missing.", async () => {
    console.log(
      "*****************Unit Test Case 16: The API should return a validation error with a 400 status code - value is missing.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: {},
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: value is required and must be a number between 0 to 100.",
      ],
    });
  });

  it("Unit Test Case 17: The API should return a validation error (400) - value exceeds 100.", async () => {
    console.log(
      "*****************Unit Test Case 17: The API should return a validation error with a 400 status code - value exceeds 100.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 101 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: value is required and must be a number between 0 to 100.",
      ],
    });
  });

  it("Unit Test Case 18: The API should return a validation error (400) - value below 0.", async () => {
    console.log(
      "*****************Unit Test Case 18: The API should return a validation error with a 400 status code - value below 0.*****************"
    );
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: -1 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "ValidationError: value is required and must be a number between 0 to 100.",
      ],
    });
  });

  it("Unit Test Case 19: The API should return internal server error with a 500 status code - DB error during scenario fetch.", async () => {
    console.log(
      "*****************Unit Test Case 19: The API should return internal server error with a 500 status code - DB error during scenario fetch.*****************"
    );
    process.env.VALIDATION = "error";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 500);
    assert.deepEqual(
      JSON.parse(result.body).errorMessage,
      "Internal Server Error"
    );
  });

  it("Unit Test Case 20: The API should return 500 - DB error during getActiveGroupIds.", async () => {
    console.log(
      "*****************Unit Test Case 20: The API should return 500 - DB error during getActiveGroupIds.*****************"
    );
    process.env.VALIDATION = "groupidserror";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 500);
    assert.deepEqual(
      JSON.parse(result.body).errorMessage,
      "Internal Server Error"
    );
  });

  it("Unit Test Case 21: The API should return 500 - DB error during upsert.", async () => {
    console.log(
      "*****************Unit Test Case 21: The API should return 500 - DB error during upsert.*****************"
    );
    process.env.VALIDATION = "upserterror";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 500);
    assert.deepEqual(
      JSON.parse(result.body).errorMessage,
      "Internal Server Error"
    );
  });

  it("Unit Test Case 22: The API should return validation error with a 400 status code when scenario simulations are not in draft status.", async () => {
    console.log(
      "*****************Unit Test Case 22: The API should return validation error with a 400 status code when scenario simulations are not in draft status.*****************"
    );
    process.env.VALIDATION = "simulationnotdraft";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), {
      errorMessage: [
        "Validation error: Updates cannot be made because at least one of the scenario simulations is not currently in draft status.",
      ],
    });
  });

  it("Unit Test Case 23: The API should return 500 - DB error during simulation status check.", async () => {
    console.log(
      "*****************Unit Test Case 23: The API should return 500 - DB error during simulation status check.*****************"
    );
    process.env.VALIDATION = "simulationfetcherror";
    const event = {
      body: JSON.stringify({
        scenarioId: "a2940022-37f7-46ba-9fac-11fdb213914c",
        userEmail: "mihikumar@deloitte.com",
        applyTo: "ALL_GROUPS",
        mode: "ALL_MONTHS",
        data: {
          fa: { value: 10 },
        },
      }),
    };
    const result = await lambda.handler(event);
    assert.equal(result.statusCode, 500);
    assert.deepEqual(
      JSON.parse(result.body).errorMessage,
      "Internal Server Error"
    );
  });
});