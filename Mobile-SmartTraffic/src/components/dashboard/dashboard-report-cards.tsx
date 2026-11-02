import { SymbolView } from 'expo-symbols';
import { LineChart, PieChart, type lineDataItem, type pieDataItem } from 'react-native-gifted-charts';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DashboardCard, dashboardCardStyles } from '@/components/dashboard/dashboard-card';
import {
  AppColors,
  ChartColors,
  Radius,
  Sizes,
  Spacing,
  StatusColors,
  Type,
} from '@/constants/theme';
import type {
  DashboardAlert,
  DashboardReport,
  FleetCategory,
  RoadDensity,
} from '@/services/contracts/dashboard';

const fleetColors: Record<FleetCategory['key'], string> = {
  cars: ChartColors.fleet.cars,
  motorcycles: ChartColors.fleet.motorcycles,
  buses: ChartColors.fleet.buses,
  trucks: ChartColors.fleet.trucks,
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function VehicleFlowCard({ report }: { report: DashboardReport }) {
  const { width } = useWindowDimensions();
  const availableWidth = Math.max(260, Math.min(width - Spacing.five * 2 - Spacing.four, 680));
  const maxValue = report.period === '7days' ? 24000 : 2500;
  const stepValue = report.period === '7days' ? 10000 : 1000;
  const yAxisLabelTexts =
    report.period === '7days' ? ['0', '10 mil', '20 mil'] : ['0', '1 mil', '2 mil'];
  const data: lineDataItem[] = report.vehicleFlow.map((point) => ({
    value: point.value,
    label: point.label,
  }));

  return (
    <DashboardCard title="Fluxo de veículos" detail={report.period === 'today' ? 'Picos 08h e 14h' : 'Por dia'}>
      <View style={styles.chartSubtitleRow}>
        <Text style={dashboardCardStyles.body}>
          {report.period === 'today' ? 'Veículos / hora' : 'Veículos / dia'}
        </Text>
        <Text style={styles.chartAccent}>
          {report.period === 'today' ? 'Dados de hoje' : 'Últimos 7 dias'}
        </Text>
      </View>
      <View
        accessibilityLabel={`Gráfico de fluxo de veículos; ${report.vehicleFlow.length} pontos demonstrativos`}
        style={styles.chart}>
        <LineChart
          animateOnDataChange
          animationDuration={420}
          areaChart={false}
          color={ChartColors.line}
          data={data}
          dataPointsColor={ChartColors.line}
          dataPointsRadius={3}
          endSpacing={8}
          height={178}
          initialSpacing={8}
          isAnimated
          maxValue={maxValue}
          noOfSections={2}
          rulesColor={ChartColors.grid}
          rulesThickness={1}
          spacing={Math.max(14, (availableWidth - 68) / Math.max(data.length - 1, 1))}
          stepValue={stepValue}
          thickness={3}
          xAxisColor={ChartColors.grid}
          xAxisLabelTextStyle={styles.axisLabel}
          xAxisThickness={1}
          yAxisColor="transparent"
          yAxisLabelTexts={yAxisLabelTexts}
          yAxisTextStyle={styles.axisLabel}
          yAxisThickness={0}
          yAxisLabelWidth={50}
        />
      </View>
    </DashboardCard>
  );
}

export function RoadDensityCard({ roads }: { roads: RoadDensity[] }) {
  return (
    <DashboardCard title="Densidade por via" detail="Agora">
      <View style={styles.roadList}>
        {roads.map((road, index) => (
          <Animated.View
            key={road.id}
            entering={FadeInDown.duration(220).delay(index * 45)}
            style={styles.roadItem}>
            <View style={styles.roadHeading}>
              <Text style={styles.roadAddress}>{road.address}</Text>
              <Text
                style={[
                  styles.roadPercentage,
                  road.level === 'high' && styles.roadPercentageHigh,
                ]}>
                {road.level === 'high' ? '▲ ' : ''}
                {road.percentage}%
              </Text>
            </View>
            <View
              accessibilityLabel={`Densidade de tráfego em ${road.address}: ${road.percentage}%`}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: road.percentage }}
              style={styles.track}>
              <Animated.View
                entering={FadeInDown.duration(380).delay(index * 55)}
                style={[
                  styles.progress,
                  {
                    width: `${road.percentage}%`,
                    backgroundColor:
                      road.level === 'high' ? ChartColors.barHigh : ChartColors.barModerate,
                  },
                ]}
              />
            </View>
            <Text style={dashboardCardStyles.caption}>
              {road.cameraId} · {road.level === 'high' ? 'Alta densidade' : 'Fluxo moderado'}
            </Text>
          </Animated.View>
        ))}
      </View>
    </DashboardCard>
  );
}

export function FleetCompositionCard({ report }: { report: DashboardReport }) {
  const { width } = useWindowDimensions();
  const radius = width < 430 ? 62 : 76;
  const pieData: pieDataItem[] = report.fleet.map((category) => ({
    value: category.count,
    color: fleetColors[category.key],
    text: `${category.percentage}%`,
  }));

  return (
    <DashboardCard title="Composição da frota">
      <View style={styles.fleetContent}>
        <View
          accessibilityLabel="Gráfico de rosca com a composição ilustrativa da frota"
          style={styles.pieChart}>
          <PieChart
            data={pieData}
            donut
            focusOnPress={false}
            innerCircleColor={AppColors.backgroundElement}
            innerRadius={radius * 0.67}
            isAnimated
            radius={radius}
            showText={false}
            strokeColor={AppColors.backgroundElement}
            strokeWidth={2}
            centerLabelComponent={() => (
              <View style={styles.pieCenter}>
                <Text style={styles.pieCenterValue}>{report.metrics.vehicles.value}</Text>
                <Text style={dashboardCardStyles.caption}>veículos</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.fleetLegend}>
          {report.fleet.map((category) => (
            <View key={category.key} style={styles.legendRow}>
              <View style={[styles.legendSwatch, { backgroundColor: fleetColors[category.key] }]} />
              <Text style={styles.legendLabel}>{category.label}</Text>
              <Text style={styles.legendPercentage}>{category.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.fleetCounts}>
        {report.fleet.map((category) => (
          <Text key={category.key} style={dashboardCardStyles.body}>
            {numberFormatter.format(category.count)} {category.label.toLocaleLowerCase('pt-BR')}
          </Text>
        ))}
      </View>
      <Text style={styles.overloadText}>
        Pesados: {report.overloadedVehiclePercentage}% veículos · {report.overloadedFlowPercentage}%
        {' do fluxo'}
      </Text>
    </DashboardCard>
  );
}

export function EdgePerformanceCard({ report }: { report: DashboardReport }) {
  const performance = report.edgePerformance;
  const metrics = [
    { value: `${performance.latencyMs} ms`, label: 'Latência' },
    { value: `${performance.framesPerSecond} FPS`, label: 'Processamento' },
    { value: `${performance.detectionAccuracy.toLocaleString('pt-BR')}%`, label: 'Detecção' },
  ];

  return (
    <DashboardCard title="Desempenho edge" detail={performance.model}>
      <View style={styles.edgeMetrics}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.edgeMetric}>
            <Text style={styles.edgeValue}>{metric.value}</Text>
            <Text style={dashboardCardStyles.body}>{metric.label}</Text>
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

export function TrafficLightsCard({ report }: { report: DashboardReport }) {
  const counts = [
    { key: 'normal', label: 'normal', count: report.trafficLights.normal, color: AppColors.success },
    {
      key: 'contingency',
      label: 'contingência',
      count: report.trafficLights.contingency,
      color: AppColors.primary,
    },
    {
      key: 'serialFailure',
      label: 'falha serial',
      count: report.trafficLights.serialFailure,
      color: AppColors.error,
    },
  ];
  const total = counts.reduce((sum, item) => sum + item.count, 0);

  return (
    <DashboardCard title="Semáforos" detail={`${total} no total`}>
      <View
        accessibilityLabel={`${report.trafficLights.normal} semáforos normais, ${report.trafficLights.contingency} em contingência e ${report.trafficLights.serialFailure} com falha serial`}
        style={styles.signalTrack}>
        {counts.map((item) => (
          <Animated.View
            key={item.key}
            entering={FadeInDown.duration(350)}
            style={{
              flex: item.count,
              minWidth: item.count ? 2 : 0,
              backgroundColor: item.color,
            }}
          />
        ))}
      </View>
      <View style={styles.signalLegend}>
        {counts.map((item) => (
          <Text key={item.key} style={[styles.signalLabel, { color: item.color }]}>
            {item.count} {item.label}
          </Text>
        ))}
      </View>
    </DashboardCard>
  );
}

export function ImpactCard({ report }: { report: DashboardReport }) {
  return (
    <DashboardCard title="Impacto estimado" detail="por dia">
      <View style={styles.impactMetrics}>
        <View style={styles.impactMetric}>
          <Text style={styles.edgeValue}>
            {numberFormatter.format(report.impact.minutesSavedPerDay)} min
          </Text>
          <Text style={dashboardCardStyles.body}>economizados / dia</Text>
        </View>
        <View style={styles.impactMetric}>
          <Text style={styles.edgeValue}>
            {numberFormatter.format(report.impact.kilogramsCo2AvoidedPerDay)} kg
          </Text>
          <Text style={dashboardCardStyles.body}>CO₂ evitado / dia</Text>
        </View>
      </View>
      <Text style={dashboardCardStyles.caption}>
        Estimativa comparada ao controle de tempo fixo.
      </Text>
    </DashboardCard>
  );
}

export function RecentAlertsCard({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <DashboardCard title="Alertas recentes">
      <View style={styles.alertList}>
        {alerts.map((alert) => {
          const color =
            alert.severity === 'critical' ? StatusColors.camera.offline.fg : AppColors.warning;

          return (
            <View key={alert.id} style={styles.alertRow}>
              <SymbolView
                name={{
                  ios: alert.severity === 'critical' ? 'exclamationmark.triangle' : 'exclamationmark.triangle',
                  android: 'warning',
                  web: 'warning',
                }}
                size={Sizes.icon}
                tintColor={color}
              />
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          );
        })}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  chartSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  chartAccent: {
    ...Type.bodyStrong,
    color: AppColors.primary,
  },
  chart: {
    width: '100%',
    overflow: 'hidden',
  },
  axisLabel: {
    ...Type.caption,
    color: AppColors.textSecondary,
  },
  roadList: {
    gap: Spacing.three,
  },
  roadItem: {
    gap: Spacing.two,
  },
  roadHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  roadAddress: {
    ...Type.body,
    flex: 1,
    color: AppColors.text,
  },
  roadPercentage: {
    ...Type.bodyStrong,
    color: AppColors.textSecondary,
  },
  roadPercentageHigh: {
    color: AppColors.primary,
  },
  track: {
    height: Spacing.two,
    overflow: 'hidden',
    borderRadius: Radius.full,
    backgroundColor: ChartColors.barTrack,
  },
  progress: {
    height: '100%',
    borderRadius: Radius.full,
  },
  fleetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pieChart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    ...Type.heading,
    color: AppColors.text,
  },
  fleetLegend: {
    flex: 1,
    gap: Spacing.two,
  },
  legendRow: {
    minHeight: Sizes.minTouch - Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendSwatch: {
    width: Spacing.two,
    height: Spacing.two,
    borderRadius: Radius.sm,
  },
  legendLabel: {
    ...Type.body,
    flex: 1,
    color: AppColors.text,
  },
  legendPercentage: {
    ...Type.body,
    color: AppColors.textSecondary,
  },
  fleetCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  overloadText: {
    ...Type.bodyStrong,
    color: AppColors.primary,
  },
  edgeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  edgeMetric: {
    flex: 1,
    gap: Spacing.one,
  },
  edgeValue: {
    ...Type.display,
    color: AppColors.text,
  },
  signalTrack: {
    height: Spacing.two + Spacing.one,
    flexDirection: 'row',
    gap: Spacing.one,
    overflow: 'hidden',
    borderRadius: Radius.full,
    backgroundColor: AppColors.backgroundSelected,
  },
  signalLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  signalLabel: {
    ...Type.bodyStrong,
  },
  impactMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  impactMetric: {
    flex: 1,
    minWidth: 130,
    gap: Spacing.one,
  },
  alertList: {
    gap: Spacing.three,
  },
  alertRow: {
    minHeight: Sizes.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  alertMessage: {
    ...Type.body,
    flex: 1,
    color: AppColors.text,
  },
  alertTime: {
    ...Type.caption,
    color: AppColors.textSecondary,
  },
});
