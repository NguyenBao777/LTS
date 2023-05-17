import { useState, useEffect, useRef, ReactNode } from "react";
import { HighlightText } from "@/components";
import { Box, Button, Menu, MenuItem, TextField } from "@mui/material";

interface IListData {
	atTime: string;
	content: string;
}

const listData: IListData[] = [
	{
		atTime: "0,9s",
		content:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit sequi provident deleniti excepturi eaque. Veniam libero voluptates laudantium minus in obcaecati odio ab reiciendis? Pariatur sint magni voluptas perspiciatis cumque beatae fugit fuga. Laborum labore incidunt veniam illo reprehenderit natus totam corrupti voluptatem ab harum. Quod repellat, esse quas iure neque porro magni ratione dolores. Sed illo sint explicabo eius perferendis perspiciatis ducimus. Enim, officiis et. Odio sapiente quibusdam itaque harum iusto, voluptatum possimus nesciunt, sed fugiat quos nam aliquid, dolorem repellat nostrum recusandae officia reprehenderit aperiam! Ipsa assumenda, provident ratione nemo debitis illo, rerum, maxime atque omnis alias facilis!",
	},
	{
		atTime: "10s",
		content: "Siêu nhân không được bỏ cuộc",
	},

	{
		atTime: "13s",
		content: "Siêu nhân không được bỏ cuộc sức mạnh của tình bạn sẽ mang lại chiến thắng",
	},
];

const Home = () => {
	const [textHighlight, setTextHighlight] = useState<any[]>([]);
	const [selectionState, setSelectionState] = useState<any>();
	const [typeMenu, setTypeMenu] = useState<string>("SELECT");
	const [correctText, setCorrectText] = useState<string>("");
	const [elementRemove, setElementRemove] = useState<any>();
	const [open, setOpen] = useState<boolean>(false);
	const elementRef = useRef<HTMLElement | null>(null);
	const handleHighlightText = (e: Event, index: number): void => {
		const highlightValue = window.getSelection();
		if (highlightValue && highlightValue.rangeCount > 0 && highlightValue.toString().trim().length > 0) {
			if (textHighlight[index]?.selected.some((value: string) => value === highlightValue.toString().trim())) {
				setOpen(true);
				return;
			}

			if (listData[index]?.content.includes(highlightValue.toString().trim())) {
				const range = highlightValue.getRangeAt(0);
				setSelectionState({
					index,
					range,
					// overRow: textHighlight.filter(
					// 	(item: any) => item.index === index && item.rangeEnd > range.endOffset && item.rangeStart > range.startOffset
					// ),
					highlightValue: highlightValue.toString().trim(),
				});

				setTypeMenu("SELECT");
				elementRef.current = e.currentTarget as HTMLElement;
				setOpen(true);
			}
		}
	};

	const handleAddBroll = () => {
		const selectedText = selectionState.range.extractContents();
		const span = document.createElement("span");
		span.classList.add("bg-red-600", "text-blue-300", "select-none");
		span.appendChild(selectedText);

		selectionState.range.insertNode(span);
		span.setAttribute("data-value", `${selectionState.highlightValue.toString().trim()}`);
		span.addEventListener("click", (e) => {
			setOpen(true);
			elementRef.current = span;
			setTypeMenu("DELETE");
			setElementRemove({
				index: selectionState.index,
				element: e.target,
			});
		});

		const newTextHighlight = textHighlight.map((text, i) => {
			if (i === selectionState.index) {
				return {
					...text,
					rangeStart: selectionState.range.startOffset,
					rangeStartEnd: selectionState.range.endOffset,
					// eslint-disable-next-line no-unsafe-optional-chaining
					selected: [
						// eslint-disable-next-line no-unsafe-optional-chaining
						...text?.selected.filter((txt: string) => !selectionState.highlightValue.toString().trim().includes(txt)),
						selectionState.highlightValue.toString().trim(),
					],
				};
			}

			return text;
		});
		setTextHighlight(newTextHighlight);
		setOpen(false);
		setSelectionState(null);
	};

	const handleRemove = (dataRemove: any) => {
		const newTextHighlight = textHighlight.map((text, index) => {
			if (index === dataRemove.index) {
				const childSpan = dataRemove.element.querySelectorAll("span");
				const valueRemove: string[] = [];
				childSpan.forEach((span: any) => {
					valueRemove.push(span.getAttribute("data-value"));
					const textNode = document.createTextNode(span.textContent);
					span.replaceWith(textNode);
				});
				let switchElement = dataRemove.element;
				do {
					const parentSpan = switchElement.parentElement;
					if (parentSpan && parentSpan.tagName === "SPAN" && !!parentSpan.getAttribute("data-value")) {
						switchElement = parentSpan;
						valueRemove.push(parentSpan.getAttribute("data-value"));
						const textNode = document.createTextNode(parentSpan.textContent);
						parentSpan.replaceWith(textNode);
					}
				} while (switchElement.parentElement?.tagName === "SPAN");
				const textNode = document.createTextNode(dataRemove.element.textContent);
				dataRemove.element.replaceWith(textNode);
				valueRemove.push(dataRemove.element.getAttribute("data-value"));
				return {
					...text,
					selected: text.selected.filter((txt: string) => valueRemove.includes(txt) === false),
				};
			}

			return text;
		});
		setOpen(false);
		setTextHighlight(newTextHighlight);
	};

	const handleOnClose = () => {
		setOpen(false);
		setTypeMenu("SELECT");
	};

	const handleAddCorrect = () => {
		selectionState.range.deleteContents();
		const textNode = document.createTextNode(correctText);
		selectionState.range.insertNode(textNode);
		handleOnClose();
		setCorrectText("");
		setSelectionState(null);
	};

	useEffect(() => {
		console.log("textHighlight", textHighlight);
	}, [textHighlight]);

	useEffect(() => {
		const newListText = listData.map((item, index) => {
			const newItem = JSON.parse(
				JSON.stringify({
					...item,
					index,
					selected: [],
				})
			);

			delete newItem.content;
			return newItem;
		});
		setTextHighlight(newListText);
	}, [listData]);

	return (
		<div className="p-4 flex flex-col gap-4">
			{listData.length > 0 &&
				listData.map((item, index) => (
					<HighlightText
						handleHighlightText={handleHighlightText}
						data={item}
						index={index}
						key={`${index}_${item.atTime}`}
					/>
				))}

			<Menu
				anchorEl={elementRef.current}
				open={open}
				anchorOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
				sx={{
					marginTop: "-20px",
					"& .MuiList-root": {
						display: "flex",
						gap: "5px",
					},

					"& .MuiList-root  div": {
						backgroundColor: "#fff",
						width: "1px",
						height: "inherit",
					},
				}}
				transformOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				PaperProps={{
					style: {
						backgroundColor: "#4C667B",
					},
				}}
				onClose={() => handleOnClose()}
			>
				{typeMenu.length > 0 && typeMenu === "SELECT" ? (
					<span className="flex gap-3">
						<MenuItem onClick={() => setTypeMenu("CORRECT")}>Correct</MenuItem>
						<div></div>
						<MenuItem onClick={() => handleAddBroll()}>Add B-roll</MenuItem>
					</span>
				) : typeMenu === "DELETE" ? (
					<MenuItem onClick={() => handleRemove(elementRemove)}>Remove</MenuItem>
				) : typeMenu === "CORRECT" ? (
					<MenuItem
						sx={{
							position: "relative",
						}}
					>
						<Box
							component="span"
							sx={{
								position: "absolute",
								height: "20px",
								width: "20px",
								backgroundColor: "red",
								borderRadius: "50%",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								padding: "5px",
								overflow: "hidden",
								cursor: "pointer",
								top: "-2px",
								right: "2px",
							}}
							onClick={() => handleOnClose()}
						>
							close
						</Box>
						<input
							type="text"
							value={correctText}
							onChange={(e) => setCorrectText(e.target.value)}
							className="outline-none bg-white rounded-sm p-2 m-2 text-black"
							placeholder="add correct"
						/>
						<Button type="button" onClick={() => handleAddCorrect()}>
							check
						</Button>
					</MenuItem>
				) : null}
			</Menu>
		</div>
	);
};

export default Home;