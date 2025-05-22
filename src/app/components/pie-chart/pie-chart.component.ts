import { Component, Input, OnChanges } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
})
export class PieChartComponent implements OnChanges {
  @Input() labels: string[] = [];
  @Input() series: number[] = [];

  chartSeries: ApexNonAxisChartSeries = [];
  chartLabels: string[] = [];

  chartOptions: ApexChart = {
    type: 'pie',
    width: 380
  };

  responsiveOptions: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: 'bottom' }
      }
    }
  ];

  chartLegend: ApexLegend = {
    position: 'right',
    labels: { colors: ['#fff'], useSeriesColors: true }
  };

  chartFill: ApexFill = {
    opacity: 1
  };

  chartDataLabels: ApexDataLabels = {
    style: { colors: ['#fff'] }
  };

  ngOnChanges(): void {
    if (!this.series || !this.labels || this.series.length !== this.labels.length) return;

    // zip, sort by votes descending, then unzip
    const combined = this.series.map((value, i) => ({
      label: this.labels[i],
      value
    }));

    const sorted = combined.sort((a, b) => b.value - a.value);

    this.chartLabels = sorted.map(item => item.label);
    this.chartSeries = sorted.map(item => item.value);
  }


}
