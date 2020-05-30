const { fromPairs, flatten, isEmpty } = require("lodash");
const { getAxios, postAxios, convertYesNoUnKnown } = require("./utils");
const { generateUid } = require("./uid");
const mapping = require("./mapping.json");
exports.routes = (app, io) => {
  app.get("/", async (req, res) => {
    try {
      const { data } = await getAxios("trackedEntityInstances.json", {
        ouMode: "ALL",
        program: "o6TN8Sr45CZ",
        fields: "*",
      });
      const allData = data.trackedEntityInstances.map((tei) => {
        const {
          attributes,
          enrollments,
          programOwners,
          relationships,
          ...trackedEntityInstance
        } = tei;

        const processedEvents = enrollments.map((enrollment) => {
          const {
            events,
            relationships,
            attributes,
            notes,
            ...others
          } = enrollment;
          const allEvents = events.map(
            ({ dataValues, notes, relationships, ...eventInfo }) => {
              const dvs = fromPairs(
                dataValues.map((dv) => {
                  return [dv.dataElement, dv.value];
                })
              );
              return { ...eventInfo, ...dvs, ...others };
            }
          );
          return allEvents;
        });

        const allAttributes = fromPairs(
          attributes.map((dv) => {
            return [dv.attribute, dv.value];
          })
        );
        return {
          ...trackedEntityInstance,
          ...allAttributes,
          events: flatten(processedEvents),
        };
      });
      return res.status(200).send(allData);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.post("/", async (req, res) => {
    let payload = req.body;

    const enrollmentDate = new Date().toISOString();

    const poe = await getAxios(
      "trackedEntityAttributes/CLzIR1Ye97b/generate.json"
    );

    const orgUnit = "tAN8bVxaZ0V";
    const program = "nBWFG3fYC8N";
    const trackedEntityType = "KWN8FUfvO5G";
    const trackedEntityInstanceId = generateUid();

    let enrollment = {
      orgUnit,
      program,
      trackedEntityInstance: trackedEntityInstanceId,
      enrollmentDate,
      incidentDate: enrollmentDate,
      enrollment: generateUid(),
    };

    let attributes = mapping
      .filter((m) => !isEmpty(m.rects))
      .map((a) => {
        return { attribute: a.id, value: payload[a.rects] };
      });

    attributes = [
      ...attributes,
      {
        value: poe.value,
        attribute: "CLzIR1Ye97b",
      },
    ];

    const trackedEntityInstance = {
      attributes,
      trackedEntityInstance: trackedEntityInstanceId,
      trackedEntityType,
      orgUnit,
      enrollments: [enrollment],
    };

    const { response } = await postAxios("trackedEntityInstances", {
      trackedEntityInstances: [trackedEntityInstance],
    });

    return res.status(201).send({ created: trackedEntityInstanceId });
  });
};
