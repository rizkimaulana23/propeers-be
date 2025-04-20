import { ProjectResponseDto } from "src/project/dto/response/project-response.dto";
import { CommissionResponseDTO } from "./commission-response.dto";

export class DetailFinanceDTO {
    totalCommssion: number;

    mapProportion: Map<string, number>;

    project: ProjectResponseDto;

    listCommissionProject: CommissionResponseDTO[];

    constructor(partial: Partial<DetailFinanceDTO>) {
        Object.assign(this, partial);
    }

    toJSON() {
        return {
          totalCommssion: this.totalCommssion,
          mapProportion: Object.fromEntries(this.mapProportion),
          project: this.project,
          listCommissionProject: this.listCommissionProject
        };
    }
}