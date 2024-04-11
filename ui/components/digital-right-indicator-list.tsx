import { DigitalRightsPillar} from "database/ancillary";
import { Score } from "database/processed/db";
import { roundNumber } from "lib";
import { ReactChild, ReactFragment, ReactPortal } from "react";
import { FaLink, FaSourcetree } from "react-icons/fa";
import useSWR from "swr";

interface IndicatorListProps {
  country: string;
  pillar: DigitalRightsPillar;
  isShowingRawScores: boolean;
  showIndicators: boolean;
  showMissingIndicators: boolean;
  showSources: boolean;
}

const fetchIndicators = async (
  _: string,
  country: string,
  pillar: string,
) => {
  let url = `/api/digital-right-indicators`;
  let params = { country, pillar };
  let stringifiedParams = new URLSearchParams(params).toString();
  // @ts-ignore
  const res = await fetch(`${url}?${stringifiedParams}`);
  return await res.json();
};

export function DigitalRightIndicatorList(props: IndicatorListProps) {
  const {
    country,
    pillar,
    isShowingRawScores,
    showIndicators,
    showMissingIndicators,
    showSources,
  } = props;
  const { data } = useSWR(
    ["indicators", country, pillar],
    fetchIndicators
  );
  if (!data)
    return <p className="text-sm text-gray-600">Loading indicator data...</p>;

  if (!showIndicators)
    return (
      <p className="font-medium text-sm mb-2">
        based on {data.length} indicator
        {data.length === 0 ? "s" : data.length > 1 ? "s" : ""}
      </p>
    );

  return (
    <div>
      <ul className="space-y-2">
        { data.filter( (ind : any) => ind['data_status'] === '1' ).map((indicator: any) => (
          <Indicator
            key={indicator.Indicator}
            indicator={indicator}
            showSources={showSources}
            isShowingRawScores={isShowingRawScores}
          />
        ))}
        {!showMissingIndicators && (
          <MissingIndicators
            filledIndicators={data.filter( (ind : any) => ind['data_status'] === '1' )}
            country={country}
            pillar={pillar}
            showSources={showSources}
            isShowingRawScores={isShowingRawScores}
          />
        )}
        {showMissingIndicators && data.filter( (ind : any) => ind['data_status'] === '0' ).map((indicator: any) => (
          <Indicator
            key={indicator.Indicator}
            indicator={indicator}
            showSources={showSources}
            isShowingRawScores={isShowingRawScores}
          />
        ))}
      </ul>
    </div>
  );
}

const fetchIndicatorsForPillar = async (
  _: string,
  country: string,
  pillar: string,
) => {
  let url = `/api/digital-right-indicators-for-pillar`;
  let params = { country, pillar};
  let stringifiedParams = new URLSearchParams(params).toString();
  // @ts-ignore
  const res = await fetch(`${url}?${stringifiedParams}`);
  return await res.json();
};
const MissingIndicators = ({
  filledIndicators,
  country,
  pillar,
  showSources,
  isShowingRawScores,
}: {
  filledIndicators: Score[];
  country: string;
  pillar: DigitalRightsPillar;
  showSources: boolean;
  isShowingRawScores: boolean;
}) => {
  const { data: allIndicators } = useSWR(
    ["indicators", country, pillar, true],
    fetchIndicatorsForPillar
  );
  if (!allIndicators)
    return (
      <p className="text-sm text-gray-600">Loading missing indicators...</p>
    );

  const missingIndicators = allIndicators
    .filter(
      (indicator: Score) =>
        !filledIndicators.find(
          ({ Indicator }: Score) => Indicator === indicator["Indicator"]
        )
    )
    .map((indicator: Score) => ({
      ...indicator,
      new_rank_score: null,
      data_col: null,
    }));

  return (
    <>
      {missingIndicators.map((indicator: any) => (
        <Indicator
          key={indicator.Indicator}
          indicator={indicator}
          showSources={showSources}
          isShowingRawScores={isShowingRawScores}
        />
      ))}
    </>
  );
};


const Indicator = ({
  indicator,
  showSources,
  isShowingRawScores,
}: {
  indicator: any & { sources: any[] };
  showSources: boolean;
  isShowingRawScores: boolean;
}) => {
  const hasNoData = indicator.data_col === null;
  // we want to get the source name from the list of sources,
  // but if empty, we need to fall back to the indicator's "Data Source"
  const sources = (indicator.sources || [indicator]).map((ind: { [x: string]: any; }) => ({
    link: ind["Source URL"],
    source: ind["Source Name"],
    year: ind["Year"]
  })).filter((ind: { source: any; link: any; }) => ind.source && ind.link);
  const value = +indicator.new_rank_score;
  const disp_val = value == 0 ? 0 : roundNumber(value, 2);
  return (
    <li className={hasNoData ? "text-slate-500" : ""}>
      <div className="flex items-center justify-between">
        <span className="text-sm">{indicator.Indicator}</span>
        <span className="font-mono text-xs ml-4 flex-shrink-0">
          {hasNoData ? "Data unavailable" : disp_val}
        </span>
      </div>
      {isShowingRawScores && !hasNoData && (
        <ul className="mt-1 mb-2 divide-y-1">
          <li className="text-slate-600 text-xs mb-3">
            <div className="group flex items-center">
              <FaSourcetree className="group-hover:no-underline mr-1 flex-none" />
              <span>{indicator.data_col}</span>
            </div>
          </li>
        </ul>
      )}
      {isShowingRawScores && hasNoData && (
        <ul className="mt-1 mb-2 divide-y-1">
          <li className="text-slate-600 underline text-xs mb-3">
            <div className="group flex items-center">
              <span>"Data unavailable"</span>
            </div>
          </li>
        </ul>
      )}
      {showSources && sources.length === 0 && (
        <p className="text-xs text-gray-600">Source Data Unavailable</p>
      )}
      {showSources && sources.length > 0 && (
        <ul className="mt-1 mb-2 divide-y-1">
          {sources.map((source: { link: string | undefined; source: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; year: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; }, i: number) => {
            return (
              <li className="text-slate-600 underline text-xs mb-3" key={i}>
                <a
                  className="group flex items-center"
                  target="_blank"
                  href={source.link}
                >
                  <FaLink className="group-hover:no-underline mr-1 flex-none" />
                  <span className="group-hover:underline">
                    {source.source}
                  </span> &nbsp; 
                  <span className="group-hover:no-underline">
                    -<em>&nbsp;{source.year}</em>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};