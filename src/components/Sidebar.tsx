import React, { useEffect, useState, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeftIcon,
  StarIcon,
  ClockIcon,
  RouteIcon,
  CalendarIcon,
  GlobeIcon,
  MapPinIcon,
  ArrowRightIcon,
  TrendingUpIcon } from
'lucide-react';
import {
  type JourneyStop,
  type Activity,
  journeyStops,
  activities,
  getActivitiesForStop,
  getStopsByLevel3,
  getStopsByLevel2,
  getStopsByCountry,
  TYPE_COLORS,
  TYPE_ICONS,
  COUNTRIES,
  LEVEL2_REGIONS,
  LEVEL3_REGIONS,
  getLevel2ForCountry,
  getLevel3ForLevel2,
  getLevel3ForCountry,
  countrySkipsLevel2 } from
'../data/index';
import { parseRoute, buildStopUrl, buildActivityUrl } from '../utils/routing';
import { HomeContent } from '../HomeContent';
// ─── View state machine ───────────────────────────────────────────────────────
type ViewState =
{
  type: 'countries';
} |
{
  type: 'level2';
  countryId: string;
} |
{
  type: 'level3';
  level2Id: string;
  countryId: string;
} |
{
  type: 'stopDetail';
  stopId: number;
} |
{
  type: 'activityDetail';
  activityId: string;
};
interface SidebarProps {
  selectedStopId: number | null;
  selectedActivityId: string | null;
  onStopClick: (stop: JourneyStop) => void;
  onActivityClick: (activity: Activity) => void;
  onClearSelection: () => void;
  currentView: 'home' | 'trips' | 'bucket-list' | 'activities';
}
function NavRow({
  label,
  sub,
  badge,
  onClick





}: {label: string;sub?: string;badge?: string | number;onClick: () => void;}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors flex items-center justify-between group">
      
      <div>
        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-accent)] transition-colors block">
          {label}
        </span>
        {sub &&
        <span className="text-xs text-[var(--color-text-secondary)] mt-0.5 block">
            {sub}
          </span>
        }
      </div>
      {badge !== undefined &&
      <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] group-hover:bg-[var(--color-bg-surface)] group-hover:text-[var(--color-text-primary)] px-2 py-1 rounded-full shrink-0 transition-colors">
          {badge}
        </span>
      }
    </button>);

}
function StopCard({
  stop,
  onClick



}: {stop: JourneyStop;onClick: () => void;}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors group">
      
      <div className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-accent)] transition-colors">
        {stop.name}
      </div>
      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
        {stop.date}
      </div>
    </button>);

}
// ─── Main component ───────────────────────────────────────────────────────────
export function Sidebar({
  selectedStopId,
  selectedActivityId,
  onStopClick,
  onActivityClick,
  onClearSelection,
  currentView
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<ViewState>({
    type: 'countries'
  });
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  useEffect(() => {
    const route = parseRoute(location.pathname);
    if (selectedActivityId) {
      setView({
        type: 'activityDetail',
        activityId: selectedActivityId
      });
    } else if (selectedStopId) {
      setView({
        type: 'stopDetail',
        stopId: selectedStopId
      });
    } else if (route.view === 'trips') {
      if (route.countryId && route.regionId) {
        const stop = journeyStops.find(
          (s) =>
          s.countryId === route.countryId && s.level3Id === route.regionId
        );
        if (stop) {
          setView({
            type: 'level3',
            level2Id: stop.level2Id,
            countryId: route.countryId
          });
        }
      } else if (route.countryId) {
        if (countrySkipsLevel2(route.countryId)) {
          const l2 = getLevel2ForCountry(route.countryId)[0];
          setView({
            type: 'level3',
            level2Id: l2.id,
            countryId: route.countryId
          });
        } else {
          setView({
            type: 'level2',
            countryId: route.countryId
          });
        }
      } else {
        setView({
          type: 'countries'
        });
      }
    } else {
      setView((prev) =>
      prev.type === 'stopDetail' || prev.type === 'activityDetail' ?
      {
        type: 'countries'
      } :
      prev
      );
    }
  }, [selectedStopId, selectedActivityId, location.pathname]);
  const handleBack = () => {
    if (view.type === 'activityDetail') {
      const activity = activities.find((a) => a.id === view.activityId);
      if (currentView === 'activities') {
        navigate('/activities');
        return;
      }
      if (activity?.stopId) {
        const stop = journeyStops.find((s) => s.id === activity.stopId);
        if (stop) {
          navigate(buildStopUrl(stop));
          return;
        }
      }
      navigate('/trips');
    } else if (view.type === 'stopDetail') {
      const stop = journeyStops.find((s) => s.id === view.stopId);
      if (stop) {
        navigate(`/trips/${stop.countryId}/${stop.level3Id}`);
      } else {
        navigate('/trips');
      }
    } else if (view.type === 'level3') {
      if (countrySkipsLevel2(view.countryId)) {
        navigate('/trips');
      } else {
        navigate(`/trips/${view.countryId}`);
      }
    } else if (view.type === 'level2') {
      navigate('/trips');
    }
  };
  const renderHeader = () => {
    if (currentView === 'home' && !selectedStopId && !selectedActivityId) {
      return (
        <div className="px-5 py-4 border-b border-[var(--color-border-default)] bg-transparent">
          <div className="flex items-center gap-2 mb-0.5">
            <GlobeIcon className="w-5 h-5 text-[var(--color-interactive-accent)]" />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Roamr
            </h1>
          </div>
        </div>);

    }
    if (view.type === 'countries') {
      return (
        <div className="px-5 py-4 border-b border-[var(--color-border-default)] bg-transparent">
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUpIcon className="w-5 h-5 text-[var(--color-interactive-accent)]" />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Explore Trips
            </h1>
          </div>
        </div>);

    }
    let backLabel = '';
    if (view.type === 'level2') backLabel = 'Countries';else
    if (view.type === 'level3')
    backLabel = countrySkipsLevel2(view.countryId) ?
    'Countries' :
    LEVEL2_REGIONS.find((r) => r.id === view.level2Id)?.name ??
    'Regions';else
    if (view.type === 'stopDetail')
    backLabel =
    LEVEL3_REGIONS.find(
      (r) =>
      r.id === journeyStops.find((s) => s.id === view.stopId)?.level3Id
    )?.name ?? 'Regions';else
    if (view.type === 'activityDetail')
    backLabel =
    currentView === 'activities' ?
    'Activities' :
    journeyStops.find(
      (s) =>
      s.id ===
      activities.find((a) => a.id === view.activityId)?.stopId
    )?.name ?? 'Stops';
    return (
      <div className="px-3 py-3 border-b border-[var(--color-border-default)] flex items-center bg-transparent pt-[16px] pb-[16px]">
        <button
          onClick={handleBack}
          className="flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-interactive-accent)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--color-bg-subtle)]">
          
          <ChevronLeftIcon className="w-4 h-4 mr-1" /> {backLabel}
        </button>
      </div>);

  };
  const renderContent = () => {
    // ── Home View ──
    if (currentView === 'home' && !selectedStopId && !selectedActivityId) {
      return (
        <HomeContent
          onStopClick={onStopClick}
          onActivityClick={onActivityClick} />);


    }
    // ── Level 1: Countries ──
    if (view.type === 'countries') {
      return (
        <div className="p-3 space-y-1">
          {COUNTRIES.map((country) => {
            const stopCount = getStopsByCountry(country.id).length;
            if (stopCount === 0) return null;
            return (
              <NavRow
                key={country.id}
                label={`${country.emoji}  ${country.name}`}
                badge={`${stopCount} stops`}
                onClick={() => navigate(`/trips/${country.id}`)} />);


          })}
        </div>);

    }
    // ── Level 2: Regions ──
    if (view.type === 'level2') {
      const country = COUNTRIES.find((c) => c.id === view.countryId);
      return (
        <div className="p-3 space-y-1">
          <div className="px-4 py-2 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-interactive-accent)] opacity-80">
              {country?.name}
            </h2>
          </div>
          {getLevel2ForCountry(view.countryId).map((l2) =>
          <NavRow
            key={l2.id}
            label={l2.name}
            badge={`${getStopsByLevel2(l2.id).length} stops`}
            onClick={() => {
              const firstStop = getStopsByLevel2(l2.id)[0];
              if (firstStop)
              navigate(`/trips/${view.countryId}/${firstStop.level3Id}`);
            }} />

          )}
        </div>);

    }
    // ── Level 3: Sub-regions ──
    if (view.type === 'level3') {
      const l2 = LEVEL2_REGIONS.find((r) => r.id === view.level2Id);
      return (
        <div className="p-3 space-y-1">
          <div className="px-4 py-2 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-interactive-accent)] opacity-80">
              {l2?.name}
            </h2>
          </div>
          {getLevel3ForLevel2(view.level2Id).map((l3) => {
            const stops = getStopsByLevel3(l3.id);
            if (stops.length === 0) return null;
            return (
              <Fragment key={`stops-${l3.id}`}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
                    {l3.name}
                  </p>
                </div>
                {stops.map((stop) =>
                <StopCard
                  key={stop.id}
                  stop={stop}
                  onClick={() => onStopClick(stop)} />

                )}
              </Fragment>);

          })}
        </div>);

    }
    // ── Stop detail ──
    if (view.type === 'stopDetail') {
      const stop = journeyStops.find((s) => s.id === view.stopId);
      if (!stop) return null;
      const stopActivities = getActivitiesForStop(stop.id);
      return (
        <div className="p-5">
          <div className="mb-6">
            <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              {stop.date}
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight mb-4">
              {stop.name}
            </h2>
            <p className="text-sm text-[var(--color-text-primary)] opacity-90 leading-relaxed italic border-l-2 border-[var(--color-interactive-accent)] pl-3">
              "{stop.journal}"
            </p>
          </div>
          {stopActivities.length > 0 &&
          <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                Activities here
              </h3>
              <div className="space-y-2">
                {stopActivities.map((activity) =>
              <button
                key={activity.id}
                onClick={() => onActivityClick(activity)}
                className="w-full text-left p-3 rounded-lg border border-[var(--color-border-default)] hover:border-[var(--color-interactive-accent)] bg-[var(--color-bg-subtle)]/50 group transition-all">
                
                    <div className="flex items-start gap-2.5">
                      <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      backgroundColor: `${TYPE_COLORS[activity.type]}15`,
                      color: TYPE_COLORS[activity.type]
                    }}>
                    
                        {TYPE_ICONS[activity.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-interactive-accent)] transition-colors">
                            {activity.name}
                          </span>
                          {activity.highlight &&
                      <StarIcon
                        className="w-3 h-3 text-[var(--color-primitive-gold)] shrink-0"
                        fill="currentColor" />

                      }
                        </div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                          {activity.distance ?
                      `${activity.distance} mi · ` :
                      ''}
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </button>
              )}
              </div>
            </div>
          }
        </div>);

    }
    // ── Activity detail ──
    if (view.type === 'activityDetail') {
      const activity = activities.find((a) => a.id === view.activityId);
      if (!activity) return null;
      return (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
              style={{
                backgroundColor: TYPE_COLORS[activity.type]
              }}>
              
              {TYPE_ICONS[activity.type]} {activity.type}
            </span>
            {activity.highlight &&
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primitive-gold)]/15 text-[var(--color-primitive-gold)]">
                <StarIcon className="w-3 h-3" fill="currentColor" /> Highlight
              </span>
            }
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight mb-6">
            {activity.name}
          </h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <CalendarIcon className="w-4 h-4 text-[var(--color-interactive-accent)]" />
              <span>{activity.date}</span>
            </div>
            {activity.distance &&
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <RouteIcon className="w-4 h-4 text-[var(--color-interactive-accent)]" />
                <span>{activity.distance} miles</span>
              </div>
            }
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <ClockIcon className="w-4 h-4 text-[var(--color-interactive-accent)]" />
              <span>{activity.time} moving time</span>
            </div>
          </div>
          {activity.desc &&
          <div className="pt-5 border-t border-[var(--color-border-default)]">
              <p className="text-sm text-[var(--color-text-primary)] opacity-90 leading-relaxed">
                {activity.desc}
              </p>
            </div>
          }
        </div>);

    }
    return null;
  };
  const renderFooter = () => {
    if (currentView === 'home' || view.type === 'countries') {
      return (
        <div className="p-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shrink-0">
          <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">
            <span>
              {
              COUNTRIES.filter((c) => getStopsByCountry(c.id).length > 0).
              length
              }{' '}
              countries
            </span>
            <span>{journeyStops.length} stops</span>
            <span>{activities.length} activities</span>
          </div>
        </div>);

    }
    return null;
  };
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full z-20 w-[350px] frosted-glass border-r border-[var(--color-border-default)] shadow-xl flex-col">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
        {renderFooter()}
      </div>

      {/* Mobile Bottom Sheet — portaled to body so map canvas cannot steal touches */}
      {createPortal(
        <div
          className="flex md:hidden fixed bottom-16 left-0 w-full z-50 frosted-glass border-t border-[var(--color-border-default)] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex-col rounded-t-2xl transition-all duration-300 ease-out overflow-hidden min-h-0"
          style={{
            height: isSheetExpanded ? '60vh' : '120px',
          }}
          role="region"
          aria-label="Trip details">
          <button
            type="button"
            className="w-full min-h-[44px] flex items-center justify-center shrink-0 border-0 bg-transparent p-0 cursor-pointer"
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
            aria-expanded={isSheetExpanded}
            aria-label={
              isSheetExpanded ? 'Collapse trip panel' : 'Expand trip panel'
            }>
            <span className="w-9 h-1 rounded-full bg-[var(--color-border-default)] block" />
          </button>
          <div
            className="shrink-0 min-h-0"
            onClick={() => !isSheetExpanded && setIsSheetExpanded(true)}
            onKeyDown={(e) => {
              if (
                !isSheetExpanded &&
                (e.key === 'Enter' || e.key === ' ')
              ) {
                e.preventDefault();
                setIsSheetExpanded(true);
              }
            }}
            role={!isSheetExpanded ? 'button' : undefined}
            tabIndex={!isSheetExpanded ? 0 : undefined}
            aria-label={!isSheetExpanded ? 'Expand trip panel' : undefined}>
            {renderHeader()}
          </div>
          <div
            className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar ${!isSheetExpanded ? 'pointer-events-none' : ''}`}
            style={{
              opacity: isSheetExpanded ? 1 : 0,
              transition: 'opacity 0.2s',
              touchAction: isSheetExpanded ? 'pan-y' : undefined,
            }}
            aria-hidden={!isSheetExpanded}>
            {renderContent()}
          </div>
        </div>,
        document.body
      )}
    </>);

}