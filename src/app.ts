import Contracts = require("TFS/Work/Contracts");
import RestClientDefinitions = require("TFS/Work/RestClient");
import { TeamContext } from "TFS/Core/Contracts";
import { WebContext } from "VSS/Common/Contracts/Platform";

export function getData(): void {
    VSS.require(["TFS/Work/RestClient"], (RestClientService) => {
        let context: WebContext = VSS.getWebContext();
        let teamContext: TeamContext = {
            projectId: context.project.id,
            project: context.project.name,
            teamId: context.team.id,
            team: context.team.name
        };

        let client: RestClientDefinitions.WorkHttpClient5 =
            <RestClientDefinitions.WorkHttpClient5>RestClientService.getClient();

        client.getTeamIterations(teamContext).then((iterations: Contracts.TeamSettingsIteration[]) => {
            for (let iteration of iterations) {
                console.log(iteration.name);
            }
        });
    });
}
