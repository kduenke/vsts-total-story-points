import Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/WorkItemTracking/RestClient");
import { WebContext } from "VSS/Common/Contracts/Platform";

export function GetCurrentIterationTotalStoryPoints(client: RestClient.WorkItemTrackingHttpClient5): PromiseLike<number> {
    let context: WebContext = VSS.getWebContext();
    let wiql: Contracts.Wiql = {
        query: `SELECT [Microsoft.VSTS.Scheduling.StoryPoints]
                          FROM workitems
                         WHERE [System.IterationPath] = @CurrentIteration
                           AND [System.WorkItemType] = "User Story"
                           AND [Microsoft.VSTS.Scheduling.StoryPoints] > 0`
    };

    return client.queryByWiql(wiql, context.project.id, context.team.id)
        .then((results: Contracts.WorkItemQueryResult) => {
            return results.workItems;
        })
        .then((workItems: Contracts.WorkItemReference[]) => {
            if (workItems.length > 0) {
                let ids: number[] = workItems.map(workItem => workItem.id);
                let fields: string[] = ["Microsoft.VSTS.Scheduling.StoryPoints"];

                return client.getWorkItems(ids, fields)
                    .then((workItems: Contracts.WorkItem[]) => {
                        return workItems
                            .map(workItem => parseInt(workItem.fields["Microsoft.VSTS.Scheduling.StoryPoints"]))
                            .reduce((a, b) => a + b);
                    });
            } else {
                return 0;
            }
        }, (rejected: any) => {
            let message = rejected.message || rejected;
            console.error(message);

            return 0;
        });
}
