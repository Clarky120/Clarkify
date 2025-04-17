import { Component, Input } from '@angular/core';
import { IMatchScoreboard } from '@clarkify/types/match';
import { SortableTable, TableData } from 'sortable-table';
import { ColumnDefinition } from 'sortable-table';

@Component({
  selector: 'scoreboard',
  standalone: true,
  imports: [SortableTable],
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class Scoreboard {
  @Input({ required: true }) scoreboard!: IMatchScoreboard[];

  mode: 'seperate' | 'joined' = 'seperate';

  teamATable!: TableData<IMatchScoreboard>;
  teamBTable!: TableData<IMatchScoreboard>;
  joinedTable!: TableData<IMatchScoreboard>;

  ngOnChanges() {
    if (this.scoreboard) {
      switch (this.mode) {
        case 'seperate':
          this.teamATable = this.calculateTables(
            this.scoreboard.filter((s) => s.teamId === '2'),
          );
          this.teamBTable = this.calculateTables(
            this.scoreboard.filter((s) => s.teamId === '3'),
          );
          break;
        case 'joined':
          this.joinedTable = this.calculateTables(this.scoreboard);
          break;
      }
    }
  }

  private calculateTables(
    scoreboard: IMatchScoreboard[],
  ): TableData<IMatchScoreboard> {
    const columns: ColumnDefinition<any>[] = [
      { key: 'player-id', label: 'Player ID', sortable: false, type: 'text' },
      { key: 'player-name', label: 'Name', sortable: true, type: 'text' },
      { key: 'kills', label: 'Kills', sortable: true, type: 'number' },
      { key: 'assists', label: 'Assists', sortable: true, type: 'number' },
      { key: 'deaths', label: 'Deaths', sortable: true, type: 'number' },
      { key: 'adr', label: 'ADR', sortable: true, type: 'number' },
      {
        key: 'headshot-percentage',
        label: 'Headshot %',
        sortable: true,
        type: 'number',
      },
    ];

    return {
      columns: columns,
      data: Object.values(scoreboard).map((s) => ({
        ...s,
        'player-id': s.playerId,
        'player-name': s.name,
        'headshot-percentage': s.headshotPercentage,
      })),
    };
  }
}
