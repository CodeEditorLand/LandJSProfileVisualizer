/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import { FunctionComponent, render } from "preact";
import { heapProfileLayoutFactory } from "vscode-js-profile-core/out/esm/heap/layout";
import {
	IProfileModel,
	ITreeNode,
} from "vscode-js-profile-core/out/esm/heap/model";
import { createTree } from "vscode-js-profile-core/out/esm/heap/tree";
import {
	DataProvider,
	IQueryResults,
	PropertyType,
} from "vscode-js-profile-core/out/esm/ql";
import styles from "../common/client.css";
import OpenFlameButton from "../common/open-flame-buttom";
import { TimeView } from "./time-view";

declare const MODEL: IProfileModel;

const tree = createTree(MODEL);

const allChildren = Object.values(tree.children);
const TimeViewWrapper: FunctionComponent<{
	query: IQueryResults<ITreeNode>;
	data: DataProvider<ITreeNode>;
}> = ({ query, data }) => <TimeView query={query} data={data} />;

const HeapProfileLayout = heapProfileLayoutFactory<ITreeNode>();

const container = document.createElement("div");
container.classList.add(styles.wrapper);
document.body.appendChild(container);
render(
	<HeapProfileLayout
		data={{
			data: DataProvider.fromArray(allChildren, (n) =>
				Object.values(n.children),
			),
			genericMatchStr: (n) =>
				[
					n.callFrame.functionName,
					n.callFrame.url,
					n.src?.source.path ?? "",
				].join(" "),
			properties: {
				function: {
					type: PropertyType.String,
					accessor: (n) => n.callFrame.functionName,
				},
				url: {
					type: PropertyType.String,
					accessor: (n) => n.callFrame.url,
				},
				path: {
					type: PropertyType.String,
					accessor: (n) => n.src?.relativePath ?? n.callFrame.url,
				},
				line: {
					type: PropertyType.Number,
					accessor: (n) =>
						n.src ? n.src.lineNumber : n.callFrame.lineNumber,
				},
				selfSize: {
					type: PropertyType.Number,
					accessor: (n) => n.selfSize,
				},
				totalSize: {
					type: PropertyType.Number,
					accessor: (n) => n.totalSize || 0,
				},
				id: {
					type: PropertyType.Number,
					accessor: (n) => n.id,
				},
			},
		}}
		body={TimeViewWrapper}
		filterFooter={OpenFlameButton}
	/>,
	container,
);
