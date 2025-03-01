import { PCDAddRequest } from "@pcd/passport-interface";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { useDispatch, useIsDownloaded } from "../../../src/appHooks";
import { useDeserialized } from "../../../src/useDeserialized";
import { useHasUploaded } from "../../../src/useSyncE2EEStorage";
import { err } from "../../../src/util";
import { Button, H2, Spacer } from "../../core";
import { MaybeModal } from "../../modals/Modal";
import { AddedPCD } from "../../shared/AddedPCD";
import { AppContainer } from "../../shared/AppContainer";
import { AppHeader } from "../../shared/AppHeader";
import { PCDCard } from "../../shared/PCDCard";
import { SyncingPCDs } from "../../shared/SyncingPCDs";

/**
 * Screen that allows the user to respond to a `PCDAddRequest` and add
 * a PCD into their wallet without proving it.
 */
export function JustAddScreen({ request }: { request: PCDAddRequest }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const { error, pcd } = useDeserialized(request.pcd);
  const hasUploaded = useHasUploaded();
  const isDownloaded = useIsDownloaded();

  const onAddClick = useCallback(async () => {
    try {
      await dispatch({ type: "add-pcds", pcds: [request.pcd] });
      setAdded(true);
    } catch (e) {
      await err(dispatch, "Error Adding PCD", e.message);
    }
  }, [dispatch, request.pcd]);

  let content;

  if (!isDownloaded) {
    return <SyncingPCDs />;
  } else if (!added) {
    content = (
      <>
        <H2>{"ADD PCD".toUpperCase()}</H2>
        <Spacer h={16} />
        {pcd && <PCDCard pcd={pcd} expanded={true} hideRemoveButton={true} />}
        {error && JSON.stringify(error)}
        <Spacer h={16} />
        <Button onClick={onAddClick}>Add</Button>
      </>
    );
  } else if (!hasUploaded) {
    return <SyncingPCDs />;
  } else {
    content = <AddedPCD onCloseClick={() => window.close()} />;
  }

  return (
    <AppContainer bg="gray">
      <MaybeModal fullScreen />
      <Container>
        <Spacer h={16} />
        <AppHeader />
        <Spacer h={16} />
        {content}
      </Container>
    </AppContainer>
  );
}

const Container = styled.div`
  padding: 16px;
  width: 100%;
  height: 100%;
  max-width: 100%;
`;
