import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { FlowChart } from '@mrblenny/react-flow-chart';
import useDebounce from 'hooks/useDebounce';
import { useStoreActions, useStoreState } from 'store';
import { Network } from 'types';
import { Loader } from 'components/common';
import CustomNodeInner from './CustomNodeInner';
import Sidebar from './Sidebar';

const Styled = {
  Designer: styled.div`
    position: relative;
    flex: 1;
  `,
  FlowChart: styled(FlowChart)`
    height: 100%;
  `,
};

interface Props {
  network: Network;
  updateStateDelay?: number;
}

const NetworkDesigner: React.FC<Props> = ({ network, updateStateDelay = 3000 }) => {
  const { setActiveId, ...callbacks } = useStoreActions(s => s.designer);
  // update the redux store with the current network's chart
  useEffect(() => {
    setActiveId(network.id);
  }, [network.id, setActiveId]);

  const { save } = useStoreActions(s => s.network);
  const chart = useStoreState(s => s.designer.activeChart);
  // prevent saving the new chart on every callback
  // which can be many, ex: onDragNode, onDragCanvas, etc
  const debouncedChart = useDebounce(chart, updateStateDelay);
  useEffect(() => {
    // save to disk when the design is changed (debounced)
    save();
  }, [debouncedChart, save]);

  if (!chart) return <Loader />;

  return (
    <Styled.Designer>
      <Styled.FlowChart
        chart={chart}
        config={{ snapToGrid: true }}
        Components={{ NodeInner: CustomNodeInner }}
        callbacks={callbacks}
      />
      <Sidebar network={network} chart={chart} />
    </Styled.Designer>
  );
};

export default NetworkDesigner;
