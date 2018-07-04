import Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/WorkItemTracking/RestClient");
import { WebContext } from "VSS/Common/Contracts/Platform";

(function getCurrentIterationTotalStoryPoints(): void {
    VSS.require(["TFS/WorkItemTracking/RestClient"], (RestClientModule) => {
        let context: WebContext = VSS.getWebContext();
        let client: RestClient.WorkItemTrackingHttpClient5 =
            <RestClient.WorkItemTrackingHttpClient5>RestClientModule.getClient();
        let wiql: Contracts.Wiql = {
            query: `SELECT [Microsoft.VSTS.Scheduling.StoryPoints]
                          FROM workitems
                         WHERE [System.IterationPath] = @CurrentIteration
                           AND [System.WorkItemType] = "User Story"
                           AND [Microsoft.VSTS.Scheduling.StoryPoints] > 0`
        };

        client.queryByWiql(wiql, context.project.id, context.team.id)
            .then((results: Contracts.WorkItemQueryResult) => {
                return results.workItems || null;
            }).then((workItems: Contracts.WorkItemReference[]) => {
                if (workItems) {
                    let ids: number[] = workItems.map(workItem => workItem.id);
                    let fields: string[] = ["Microsoft.VSTS.Scheduling.StoryPoints"];

                    client.getWorkItems(ids, fields).then((workItems: Contracts.WorkItem[]) => {
                        let totalStoryPoints: number = workItems
                            .map(workItem => parseInt(workItem.fields["Microsoft.VSTS.Scheduling.StoryPoints"]))
                            .reduce((a, b) => a + b);

                        let element: HTMLElement = document.getElementById("show-totals-backlog-panel-total");
                        element.innerText = totalStoryPoints.toString();
                    });
                }
            });
    });
})();
