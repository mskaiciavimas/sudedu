import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import tkinter as tk
from tkinter import ttk, messagebox
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import traceback
import os
import ast
from datetime import datetime

# Set style for better looking graphs
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")


class TaskPointsAnalyzer:
    def __init__(self, root):
        self.root = root
        self.root.title("Task-Based Points Analyzer & Weight Editor")
        self.root.geometry("1800x1000")

        # Configure default font sizes
        self.default_font = ('Segoe UI', 16)
        self.title_font = ('Segoe UI', 16, 'bold')
        self.button_font = ('Segoe UI', 18)
        self.tree_font = ('Segoe UI', 16)

        # Apply font settings
        self.root.option_add('*Font', self.default_font)
        self.root.option_add('*TCombobox*Listbox.font', self.default_font)

        # Define period colors
        self.period_colors = {
            0: '#FF6B6B',  # Red
            1: '#4ECDC4',  # Teal
            2: '#45B7D1',  # Blue
            3: '#FFA07A'  # Orange
        }

        # Load data
        self.load_data()

        # Initialize state
        self.current_class = 1
        self.original_weights = {}
        self.modified_weights = {}  # Structure: {period: {code: [values]}}

        # Load saved modifications
        self.load_saved_modifications()

        # Setup GUI
        self.setup_gui()

        # Load initial data
        self.update_all_displays()

    def load_data(self):
        """Load CSV data and initialize weight dictionaries."""
        try:
            # Load TaskResultArchive
            self.df_results = pd.read_csv("TaskResultArchive.csv")
            self.df_results['date'] = pd.to_datetime(self.df_results['date'])
            print(f"✓ Loaded {len(self.df_results)} records from TaskResultArchive.csv")

            # Load TaskLibrary
            self.df_tasks = pd.read_csv("TaskLibrary.csv")
            print(f"✓ Loaded {len(self.df_tasks)} tasks from TaskLibrary.csv")

            # Load StudentInfo
            self.df_students = pd.read_csv("StudentInfo.csv")
            print(f"✓ Loaded {len(self.df_students)} students from StudentInfo.csv")

            # Merge data
            self.df = self.df_results.merge(
                self.df_tasks[['id', 'taskInfo']],
                left_on='taskLibraryId',
                right_on='id',
                how='left',
                suffixes=('', '_task')
            )

            self.df = self.df.merge(
                self.df_students[['studentId', 'knowledgeLvl']],
                on='studentId',
                how='left'
            )

            self.df.rename(columns={'knowledgeLvl': 'userClass'}, inplace=True)
            print(f"✓ Merged data: {len(self.df)} records with task info and class")

            # Define periods as month ranges (period name -> [start_month, end_month])
            self.period_definitions = {
                "9-10": (9, 10),
                "11-12": (11, 12),
                "1-2": (1, 2),
                "3-8": (3, 8)
            }

            self.periods = ["9-10", "11-12", "1-2", "3-8"]

            # Assign period to each record based on month
            def assign_period(date):
                if pd.isna(date):
                    return None
                month = date.month

                if month in [9, 10]:
                    return "9-10"
                elif month in [11, 12]:
                    return "11-12"
                elif month in [1, 2]:
                    return "1-2"
                elif month in [3, 4, 5, 6, 7, 8]:
                    return "3-8"
                else:
                    return None

            self.df['period'] = self.df['date'].apply(assign_period)

            print(f"✓ Assigned periods to records")
            print(f"  Period distribution:")
            for period in self.periods:
                count = len(self.df[self.df['period'] == period])
                print(f"    {period}: {count} records")

            # Initialize weight dictionaries (same as original code)
            self.initialize_weight_dictionaries()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to load data: {str(e)}\n{traceback.format_exc()}")
            raise

    def initialize_weight_dictionaries(self):
        """Initialize the 4 period weight dictionaries."""
        # Period 1 weights (9-10)
        point_weights_period1 = {
            "userClass": {"values": [0, 1, 2, 3, 4, 5], "label": "ziniu lygis"},
            "base": {"values": [0.76, 0.76, 0.76, 0.76, 0.76, 0.76], "label": "base"},
            "C1": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "sudetis"},
            "C2": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "atimtis"},
            "C3": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "sudetis ir atimtis"},
            "C4": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "daugyba"},
            "C5": {"values": [1.25, 1.25, 1.25, 1.15, 1.15, 1.0], "label": "dalyba"},
            "C6": {"values": [1.25, 1.25, 1.25, 1.15, 1.15, 1.0], "label": "daugyba ir dalyba"},
            "C7": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "ivairius"},
            "C8": {"values": [1.25, 1.0, 0.1, 0.0, 0.0, 0.0], "label": "vienazenkliu iki 10"},
            "C9": {"values": [1.5, 1.25, 0.2, 0.0, 0.0, 0.0], "label": "vienazenkliu iki 20"},
            "C10": {"values": [1.5, 1.25, 0.2, 0.0, 0.0, 0.0], "label": "dvizenkliu ir vienazenkliu iki 20"},
            "C11": {"values": [2.0, 1.75, 0.65, 0.0, 0.0, 0.0], "label": "dvizenkliu ir vienazenkliu iki 100"},
            "C12": {"values": [2.0, 2.0, 0.85, 0.35, 0.25, 0.25], "label": "dvizenkliu iki 100"},
            "C13": {"values": [2.0, 2.0, 1.25, 0.65, 0.5, 0.5], "label": "skaiciu iki 1000"},
            "C14": {"values": [2.0, 2.0, 2.0, 1.25, 1.15, 0.75], "label": "skaiciu iki 10000"},
            "C15": {"values": [2.0, 2.0, 2.0, 2.0, 1.5, 1.15], "label": "skaiciu iki 1000000"},
            "C16": {"values": [2.0, 2.0, 2.0, 1.25, 1.25, 1.15], "label": "turinyje gretimi nuliai"},
            "C17": {"values": [2.0, 1.0, 0.3, 0.0, 0.0, 0.0], "label": "lenteline sudetis ir atimtis iki 20"},
            "C18": {"values": [2.0, 2.0, 1.0, 0.5, 0.35, 0.25], "label": "daugybos lentele"},
            "C19": {"values": [2.0, 2.0, 2.0, 1.15, 0.65, 0.5], "label": "dvizenklio is vienazenklio"},
            "C20": {"values": [2.0, 2.0, 2.0, 1.5, 0.85, 0.75], "label": "trizenklio is vienazenklio"},
            "C21": {"values": [2.0, 2.0, 2.0, 1.75, 1.15, 1.0], "label": "keturzenklio is vienazenklio"},
            "C22": {"values": [2.0, 2.0, 2.0, 1.75, 1.25, 1.0], "label": "daugiazenklio is vienzenklio"},
            "C23": {"values": [2.0, 2.0, 2.0, 2.0, 2.0, 2.0], "label": "dvizenklio is dvizenklio"},
            "C24": {"values": [2.0, 2.0, 2.0, 2.0, 2.0, 2.0], "label": "trizenklio is dvizenklio"},
            "C25": {"values": [2.0, 2.0, 2.0, 2.0, 2.0, 2.0], "label": "keturzenklio is dvizenklio"},
            "C26": {"values": [2.0, 2.0, 2.0, 2.0, 2.0, 2.0], "label": "daugiazenklio is dvizenklio"},
            "C27": {"values": [2.0, 2.0, 2.0, 2.0, 2.0, 2.0], "label": "daugiazenkliu"},
            "C28": {"values": [2.0, 2.0, 2.0, 1.0, 0.35, 0.15], "label": "is pilnu lengvesni"},
            "C29": {"values": [2.0, 2.0, 2.0, 1.0, 0.5, 0.25], "label": "is pilnu sunkesni"},
            "C30": {"values": [2.0, 2.0, 1.5, 1.25, 1.25, 1.25],
                    "label": "daugiazenklio is vienazenklio (dalmenyje 0)"},
            "C31": {"values": [1.25, 1.0, 0.1, 0, 0, 0], "label": "ivairus iki 10"},
            "C32": {"values": [1.5, 1.25, 0.2, 0, 0, 0], "label": "ivairus iki 20"},
            "C33": {"values": [2.0, 1.75, 0.65, 0, 0, 0], "label": "ivairus iki 100"},
            "C34": {"values": [2.0, 2.0, 1.25, 0.75, 0.5, 0.5], "label": "ivairus iki 1000"},
            "C35": {"values": [2.0, 2.0, 2.0, 1.15, 0.75, 0.75], "label": "ivairus iki 10000"},
            "C36": {"values": [2.0, 2.0, 2.0, 2.0, 1.25, 1.15], "label": "ivairus iki 1000000"},
            "C37": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "neperzengiant"},
            "C38": {"values": [1.5, 1.5, 1.5, 1.5, 1.5, 1.5], "label": "perzengiant"},
            "C41": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "skaitine"},
            "C42": {"values": [1.25, 1.25, 1.25, 1.25, 1.25, 1.25], "label": "su nezinomuoju"},
            "C49": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "teksto supratimas"},
            "C50": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "rasyba"},
            "C51": {"values": [1.25, 1.25, 1.25, 1.25, 1.25, 1.25], "label": "turinio komponavimas"},
            "C52": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "strukturos isdestumas"},
            "C58": {"values": [1.0, 1.0, 0.75, 1.15, 0.75, 0.5], "label": "teksto supratimas lengvas"},
            "C59": {"values": [1.75, 1.75, 1.15, 1.5, 1.15, 0.75], "label": "teksto supratimas vidutinis"},
            "C60": {"values": [2.0, 2.0, 1.75, 1.75, 1.75, 1.15], "label": "teksto supratimas sunkus"},
            "C75": {"values": [1.5, 1.0, 1.0, 0.0, 0.0, 0.0], "label": "lietuviu klases 1-2"},
            "C76": {"values": [2.0, 1.75, 1.5, 1.0, 1.0, 1.0], "label": "lietuviu klases 3-4"},
            "C77": {"values": [2.0, 2.0, 1.0, 1.0, 0.5, 0.15], "label": "is pilnu simtu"},
            "C80": {"values": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "be distraktoriaus"},
            "C81": {"values": [1.25, 1.25, 1.25, 1.2, 1.25, 1.25], "label": "su distraktoriumi"},
            "remainder": {"values": [1.25, 1.25, 1.25, 1.25, 1.25, 1.25], "label": "su liekana"},
            "DL1": {"values": [1.0, 0.5, 0.15, 0.0, 0.0, 0.0], "label": "daugybos range[1] === 1"},
            "DL2": {"values": [2.0, 1.0, 0.75, 0, 0, 0], "label": "daugybos range[1] === 2"},
            "DL10": {"values": [1.25, 0.75, 0.15, 0, 0, 0],
                     "label": "daugybos range[0] === 10 AND daugybos range[1] ===10"},
            "DLALL": {"values": [2.0, 1.0, 1.0, 1.0, 1.0, 1.0], "label": "daugybos range else"}
        }

        # Copy to all periods initially (all periods start with same weights)
        point_weights_period2 = point_weights_period1.copy()
        point_weights_period3 = point_weights_period1.copy()
        point_weights_period4 = point_weights_period1.copy()

        # Map periods to weights
        self.period_point_weights = {
            "9-10": point_weights_period1,
            "11-12": point_weights_period2,
            "1-2": point_weights_period3,
            "3-8": point_weights_period4,
        }

    def load_saved_modifications(self):
        """Load previously saved modifications for all periods."""
        for period in self.periods:
            filename = f"modified_weights_period_{period}.json"

            try:
                if os.path.exists(filename):
                    with open(filename, "r", encoding="utf-8") as f:
                        saved_data = json.load(f)

                    if period not in self.modified_weights:
                        self.modified_weights[period] = {}

                    for code, data in saved_data.items():
                        if "values" in data:
                            self.modified_weights[period][code] = data["values"]

                    print(f"✓ Loaded modifications from {filename}")
            except Exception as e:
                print(f"Note: Could not load {filename}: {e}")

    def get_task_weight(self, task_code, user_class, period, use_modified=True):
        """Get task weight for specific user class and period."""
        # Use modified weights if available
        if use_modified and period in self.modified_weights:
            if task_code in self.modified_weights[period]:
                weight_array = self.modified_weights[period][task_code]
                if 0 <= user_class < len(weight_array):
                    return weight_array[user_class]

        # Fall back to original weights
        weights_dict = self.period_point_weights.get(period, {})
        weight_array = weights_dict.get(task_code, {}).get("values")

        if weight_array and 0 <= user_class < len(weight_array):
            return weight_array[user_class]
        return 1.0

    def get_c18_weight(self, mult_selection, user_class, period):
        """Calculate C18 weight based on multiplication table selection."""
        if not isinstance(mult_selection, list) or len(mult_selection) < 2:
            return 1.0

        try:
            first = int(mult_selection[0])
            second = int(mult_selection[1])

            if second == 1:
                return self.get_task_weight("DL1", user_class, period)
            elif second == 2:
                return self.get_task_weight("DL2", user_class, period)
            elif first == 10 and second == 10:
                return self.get_task_weight("DL10", user_class, period)
            else:
                return self.get_task_weight("DLALL", user_class, period)
        except (ValueError, IndexError):
            return 1.0

    def safe_parse_task_info(self, task_info):
        """Safely parse task info string."""
        if not isinstance(task_info, str):
            return task_info

        task_info = task_info.replace('true', 'True').replace('false', 'False').replace('null', 'None')

        try:
            return ast.literal_eval(task_info)
        except (ValueError, SyntaxError) as e:
            print(f"Warning: Could not parse task_info: {task_info[:100]}...")
            return []

    def calculate_task_points(self, task_info, user_class, period, correct_answers):
        """Calculate points for a task: weight × correct_answers."""
        task_info = self.safe_parse_task_info(task_info)

        # Initialize with base weight
        total = self.get_task_weight("base", user_class, period)

        skip_tasks = ['C47', 'C48', 'userClass']
        mode = task_info[0] if len(task_info) > 0 else None

        mult_table_selection = []
        has_remainder = False

        # Process task config
        if mode == "math":
            for i in range(1, len(task_info)):
                val = task_info[i]

                if i == 7 and isinstance(val, list):
                    mult_table_selection = val
                elif i == 8:
                    has_remainder = val
                elif isinstance(val, str) and val.startswith('C') and val not in skip_tasks:
                    weight = self.get_task_weight(val, user_class, period)

                    if val == 'C18':
                        weight *= self.get_c18_weight(mult_table_selection, user_class, period)

                    total *= weight

        elif mode == "lang":
            for i in range(1, len(task_info)):
                val = task_info[i]
                if isinstance(val, str) and val.startswith('C') and val not in skip_tasks:
                    total *= self.get_task_weight(val, user_class, period)

        # Apply remainder weight
        if has_remainder and mode == "math":
            total *= self.get_task_weight("remainder", user_class, period)

        # Multiply by correct answers
        points = total * correct_answers

        return round(points, 2)

    def calculate_all_points(self):
        """Calculate points for all records in dataframe."""
        points = []
        for idx, row in self.df.iterrows():
            if pd.isna(row['taskInfo']) or pd.isna(row['userClass']) or pd.isna(row['period']):
                points.append(0)
                continue

            pts = self.calculate_task_points(
                row['taskInfo'],
                int(row['userClass']),
                row['period'],
                row['correct']
            )
            points.append(pts)

        self.df['calculated_points'] = points

    def setup_gui(self):
        """Setup the GUI layout."""
        self.root.grid_rowconfigure(1, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

        control_frame = ttk.Frame(self.root, padding="20")
        control_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        graph_frame = ttk.Frame(self.root, padding="20")
        graph_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        graph_frame.grid_rowconfigure(0, weight=1)
        graph_frame.grid_columnconfigure(0, weight=1)

        self.setup_control_panel(control_frame)
        self.setup_graph_area(graph_frame)
        self.setup_weights_table()

    def setup_control_panel(self, parent):
        """Setup the control panel."""
        title_label = ttk.Label(parent, text="Task-Based Points Analyzer & Weight Editor", font=self.title_font)
        title_label.grid(row=0, column=0, columnspan=8, pady=(0, 20))

        # Class selection
        ttk.Label(parent, text="Select Class:", font=self.default_font).grid(row=1, column=0, padx=10, pady=5)
        self.class_var = tk.StringVar(value="1")
        self.class_combo = ttk.Combobox(parent, textvariable=self.class_var, values=["0", "1", "2", "3", "4", "5"],
                                        width=8, state="readonly")
        self.class_combo.grid(row=1, column=1, padx=10, pady=5)
        self.class_combo.bind("<<ComboboxSelected>>", self.on_class_changed)

        # Period selection for contribution graph
        ttk.Label(parent, text="Contribution Period:", font=self.default_font).grid(row=1, column=2, padx=10, pady=5)
        self.contrib_period_var = tk.StringVar(value=self.periods[0])
        self.contrib_period_combo = ttk.Combobox(parent, textvariable=self.contrib_period_var, values=self.periods,
                                                 width=15, state="readonly")
        self.contrib_period_combo.grid(row=1, column=3, padx=10, pady=5)
        self.contrib_period_combo.bind("<<ComboboxSelected>>", self.on_contrib_period_changed)

        # Buttons
        button_style = ttk.Style()
        button_style.configure("Large.TButton", font=self.button_font, padding=8)

        ttk.Button(parent, text="Refresh Graphs", command=self.update_all_displays, style="Large.TButton").grid(row=1,
                                                                                                                column=4,
                                                                                                                padx=10,
                                                                                                                pady=5)
        ttk.Button(parent, text="Reset Weights", command=self.reset_all_weights, style="Large.TButton").grid(row=1,
                                                                                                             column=5,
                                                                                                             padx=10,
                                                                                                             pady=5)
        ttk.Button(parent, text="Save All Periods", command=self.save_all_modifications, style="Large.TButton").grid(
            row=1, column=6, padx=10, pady=5)
        ttk.Button(parent, text="Open Weights Table", command=self.show_weights_table, style="Large.TButton").grid(
            row=1, column=7, padx=10, pady=5)
        ttk.Button(parent, text="Export Decoded Tasks",
                   command=self.export_decoded_tasks_to_csv,
                   style="Large.TButton").grid(row=1, column=8, padx=10, pady=5)

        # Info label
        self.info_label = ttk.Label(parent, text="Ready", font=self.default_font, foreground="blue")
        self.info_label.grid(row=2, column=0, columnspan=9, pady=(10, 0))

        # Task info display area (NEW)
        task_info_frame = ttk.LabelFrame(parent, text="Task Information (Click on a bar)", padding="10")
        task_info_frame.grid(row=3, column=0, columnspan=9, pady=(10, 0), sticky=(tk.W, tk.E))

        self.task_info_text = tk.Text(task_info_frame, height=4, width=100, font=('Segoe UI', 16),
                                      wrap=tk.WORD, bg='#f0f0f0', relief=tk.FLAT)
        self.task_info_text.pack(fill=tk.BOTH, expand=True)
        self.task_info_text.insert('1.0', 'Click on any bar in the graphs to see detailed task information...')
        self.task_info_text.config(state=tk.DISABLED)

    def setup_graph_area(self, parent):
        """Setup the graph display area with 6 subplots (4 periods + 1 overall + 1 contribution)."""
        self.fig, self.axes = plt.subplots(2, 3, figsize=(24, 14), dpi=100)
        self.fig.suptitle("Average Daily Points per User per Task by Period",
                          fontsize=20, fontweight='bold')

        # Flatten for easier access - now using all 6 subplots
        self.axes_flat = [self.axes[0, 0], self.axes[0, 1], self.axes[0, 2],
                          self.axes[1, 0], self.axes[1, 1], self.axes[1, 2]]

        self.canvas = FigureCanvasTkAgg(self.fig, parent)
        canvas_widget = self.canvas.get_tk_widget()
        canvas_widget.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

    def add_click_handler(self):
        """Add click handler to show task info when bars are clicked."""

        def on_click(event):
            # Check if clicking on period graphs (0-3) or contribution graph (5)
            valid_axes = self.axes_flat[:4] + [self.axes_flat[5]]

            if event.inaxes not in valid_axes:
                return

            # Check if we're clicking on a bar
            if event.inaxes in self.hover_bars:
                for bar_data in self.hover_bars[event.inaxes]:
                    bar = bar_data['bar']
                    contains, _ = bar.contains(event)
                    if contains:
                        # Display the task info in the text widget
                        self.task_info_text.config(state=tk.NORMAL)
                        self.task_info_text.delete('1.0', tk.END)
                        self.task_info_text.insert('1.0', bar_data['text'])
                        self.task_info_text.config(state=tk.DISABLED)
                        break

        self.canvas.mpl_connect("button_press_event", on_click)

    def setup_weights_table(self):
        """Setup the weights table window."""
        self.weights_window = tk.Toplevel(self.root)
        self.weights_window.title("Task Weights Editor")
        self.weights_window.geometry("800x600")
        self.weights_window.withdraw()

        main_frame = ttk.Frame(self.weights_window, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        title_label = ttk.Label(main_frame, text="Task Weights Editor", font=self.title_font)
        title_label.pack(pady=(0, 10))

        # Display current editing context
        self.weights_context_label = ttk.Label(main_frame, text="", font=('Segoe UI', 12, 'bold'))
        self.weights_context_label.pack(pady=(0, 10))

        # Period selector for weight editing
        period_frame = ttk.Frame(main_frame)
        period_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(period_frame, text="Edit Period:").pack(side=tk.LEFT, padx=5)
        self.weight_period_var = tk.StringVar(value=self.periods[0])
        self.weight_period_combo = ttk.Combobox(period_frame, textvariable=self.weight_period_var,
                                                values=self.periods, width=15, state="readonly")
        self.weight_period_combo.pack(side=tk.LEFT, padx=5)
        self.weight_period_combo.bind("<<ComboboxSelected>>", self.on_weight_period_changed)

        # Search frame
        search_frame = ttk.Frame(main_frame)
        search_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(search_frame, text="Search:").pack(side=tk.LEFT, padx=5)
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(search_frame, textvariable=self.search_var, width=40)
        self.search_entry.pack(side=tk.LEFT, padx=5)

        ttk.Button(search_frame, text="Search", command=self.filter_weights_table, width=10).pack(side=tk.LEFT, padx=2)
        ttk.Button(search_frame, text="Clear", command=self.clear_search, width=10).pack(side=tk.LEFT, padx=2)

        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Button(button_frame, text="Save Changes", command=self.save_all_modifications, width=15).pack(side=tk.LEFT,
                                                                                                          padx=5)
        ttk.Button(button_frame, text="Reset Selected", command=self.reset_selected_weights, width=15).pack(
            side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Close", command=self.weights_window.withdraw, width=15).pack(side=tk.LEFT,
                                                                                                    padx=5)

        # Treeview
        tree_frame = ttk.Frame(main_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True)

        columns = ("code", "label", "weight", "original")
        self.weights_tree = ttk.Treeview(tree_frame, columns=columns, show="headings", height=20)

        style = ttk.Style()
        style.configure("Treeview", font=self.tree_font, rowheight=25)
        style.configure("Treeview.Heading", font=('Segoe UI', 11, 'bold'))

        self.weights_tree.heading("code", text="Task Code")
        self.weights_tree.heading("label", text="Description")
        self.weights_tree.heading("weight", text="Current Weight")
        self.weights_tree.heading("original", text="Original Weight")

        self.weights_tree.column("code", width=120, anchor=tk.CENTER)
        self.weights_tree.column("label", width=350)
        self.weights_tree.column("weight", width=120, anchor=tk.CENTER)
        self.weights_tree.column("original", width=120, anchor=tk.CENTER)

        y_scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=self.weights_tree.yview)
        x_scrollbar = ttk.Scrollbar(tree_frame, orient=tk.HORIZONTAL, command=self.weights_tree.xview)
        self.weights_tree.configure(yscrollcommand=y_scrollbar.set, xscrollcommand=x_scrollbar.set)

        self.weights_tree.grid(row=0, column=0, sticky=(tk.N, tk.S, tk.E, tk.W))
        y_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        x_scrollbar.grid(row=1, column=0, sticky=(tk.E, tk.W))

        tree_frame.grid_rowconfigure(0, weight=1)
        tree_frame.grid_columnconfigure(0, weight=1)

        self.weights_tree.bind("<Double-1>", self.on_weight_double_click)
        self.search_entry.bind("<Return>", lambda e: self.filter_weights_table())

    def show_weights_table(self):
        """Show the weights table window."""
        self.weights_window.deiconify()
        self.weights_window.lift()
        self.update_weights_table()

    def on_class_changed(self, event=None):
        """Handle class selection change."""
        self.current_class = int(self.class_var.get())
        self.update_all_displays()

    def on_contrib_period_changed(self, event=None):
        """Handle contribution period change."""
        self.update_all_displays()

    def on_weight_period_changed(self, event=None):
        """Handle period change in weights editor."""
        self.update_weights_table()

    def update_all_displays(self):
        """Update graphs and calculations."""
        try:
            self.current_class = int(self.class_var.get())

            # Recalculate all points with current weights
            self.calculate_all_points()

            # Update graphs
            self.update_graphs()

            self.info_label.config(text=f"Viewing Class {self.current_class}")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to update displays: {str(e)}\n{traceback.format_exc()}")

    def decode_task_info(self, task_info_str):
        """Decode taskInfo string to human-readable text using the JS logic."""
        values = self.safe_parse_task_info(task_info_str)
        if not values or len(values) == 0:
            return "Unknown Task"

        # Load parameter dictionary
        param_dict = self.load_parameter_dictionary()

        # Map for unknown components
        unknown_component_map = {
            'C1': 'NEŽINOMAS DĖMUO',
            'C2': {
                'C43': 'NEŽINOMAS TURINYS',
                'C44': 'NEŽINOMAS ATĖMINYS'
            },
            'C3': 'NEŽINOMAS DĖMUO / TURINYS / ATĖMINYS',
            'C4': 'NEŽINOMAS DAUGINAMASIS',
            'C5': {
                'C45': 'NEŽINOMAS DALINYS',
                'C46': 'NEŽINOMAS DALIKLIS'
            },
            'C6': 'NEŽINOMAS DAUGINAMASIS / DALINYS / DALIKLIS',
            'C7': 'NEŽINOMAS DĖMUO / TURINYS / ATĖMINYS / DAUGINAMASIS / DALINYS / DALIKLIS'
        }

        def get_unknown_component(operation_type, sub_type):
            mapping = unknown_component_map.get(operation_type)
            if isinstance(mapping, dict):
                return mapping.get(sub_type, "")
            return mapping or ""

        result = []
        final_results = []

        if values[0] == "math":
            if len(values) < 10:
                return "Invalid Math Task"

            # Build result array (matching JS exactly)
            result.append(param_dict.get(values[1], {}).get("decodedParameterText", values[1]))
            result.append(param_dict.get(values[2], {}).get("decodedParameterText", values[2]))
            result.append(param_dict.get(values[3], {}).get("decodedParameterText", "") if values[3] else "")
            result.append(param_dict.get(values[4], {}).get("decodedParameterText", values[4]))

            # Handle C42 (unknown component)
            if values[4] == "C42":
                result.append(get_unknown_component(values[1], values[5]))
            else:
                result.append(param_dict.get(values[5], {}).get("decodedParameterText", values[5]))

            result.append(param_dict.get(values[6], {}).get("decodedParameterText", values[6]))
            result.append(values[7])  # multiplication table range
            result.append("DALYBA SU LIEKANA" if values[8] else "DALYBA BE LIEKANOS")
            result.append(values[9] if len(values) > 9 else "")

            # Build final_results based on operation type
            final_results.append(result[0])

            if result[0] in ["SUDĖTIS", "ATIMTIS", "SUDĖTIS IR ATIMTIS"]:
                final_results.append(result[1])
                if result[2]:
                    final_results.append(result[2])
                final_results.append(result[3])
                if result[3] == "SKAITINĖ LYGYBĖ":
                    final_results.append(result[5])
                elif result[3] == "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU":
                    final_results.append(result[3])
                final_results.append(result[5])

            elif result[0] == "DAUGYBA":
                final_results.append(result[1])
                if result[1] == "DAUGYBOS LENTELĖ" and isinstance(result[6], list) and len(result[6]) >= 2:
                    final_results.append(f"NUO {result[6][0]} IKI {result[6][1]}")
                final_results.append(result[3])
                if result[3] == "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU":
                    final_results.append(result[4])
                final_results.append(result[5])

            elif result[0] in ["DALYBA", "DAUGYBA IR DALYBA"]:
                final_results.append(result[1])
                if result[1] == "DAUGYBOS LENTELĖ" and isinstance(result[6], list) and len(result[6]) >= 2:
                    final_results.append(f"NUO {result[6][0]} IKI {result[6][1]}")
                final_results.append(result[7])
                final_results.append(result[3])
                if result[3] == "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU":
                    final_results.append(result[3])
                final_results.append(result[5])

            elif result[0] == "ĮVAIRŪS VEIKSMAI":
                final_results.append(result[1])
                final_results.append(result[3])
                if result[3] == "SKAITINĖ LYGYBĖ SU NEŽINOMUOJU":
                    final_results.append(result[3])
                final_results.append(result[5])

        elif values[0] == "lang":
            if len(values) < 4:
                return "Invalid Lang Task"

            # Build result array
            result.append(param_dict.get(values[1], {}).get("decodedParameterText", values[1]))
            result.append(param_dict.get(values[2], {}).get("decodedParameterText", values[2]))
            result.append(param_dict.get(values[3], {}).get("decodedParameterText", values[3]))

            # Handle grammar parameters (C50)
            if len(values) > 3 and values[3] == "C50":
                if len(values) > 4 and isinstance(values[4], dict):
                    grammar_params = []
                    for key in values[4].keys():
                        param_text = param_dict.get(key, {}).get("decodedParameterText", key)
                        grammar_params.append(param_text)
                    result.append("RAŠYBOS NUSTATYMAI: " + ", ".join(grammar_params))

                if len(values) > 5:
                    result.append(param_dict.get(values[5], {}).get("decodedParameterText", ""))

                if len(values) > 6:
                    result.append(
                        "DAŽNESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI" if values[6] == 1 else "RETESNI NEŽINOMŲ ŽODŽIŲ ATVEJAI")

            # Build final_results
            final_results.append(result[0])
            final_results.append(result[1])

            if result[0] == "TEKSTO SUPRATIMAS":
                if len(values) > 4:
                    if values[4] == "C82":
                        if len(values) > 5:
                            final_results.append(param_dict.get(values[5], {}).get("decodedParameterText", ""))
                        if len(values) > 6:
                            final_results.append(param_dict.get(values[6], {}).get("decodedParameterText", ""))
                    elif values[4] == "C84":
                        final_results.append(param_dict.get(values[4], {}).get("decodedParameterText", ""))

            elif result[0] == "GRAMATIKA":
                final_results.append(result[2])
                if result[1] == "RAŠYBA":
                    if len(values) > 4 and isinstance(values[4], dict):
                        grammar_params = []
                        for key in values[4].keys():
                            param_text = param_dict.get(key, {}).get("decodedParameterText", key)
                            grammar_params.append(param_text)
                        final_results.append("RAŠYBOS NUSTATYMAI: " + ", ".join(grammar_params))

                    if result[2] == "3-4 KLASĖ":
                        if len(values) > 4 and isinstance(values[4], dict):
                            if "C62" in values[4] or "C63" in values[4] or "C65" in values[4]:
                                if len(result) > 4:
                                    final_results.append(result[4])
                    else:
                        if len(result) > 5:
                            final_results.append(result[5])

        # Join and return

        return " | ".join([str(r) for r in final_results if r])

    def load_parameter_dictionary(self):
        """Load parameter dictionary from parameter_dictionary.js file."""
        param_dict = {}
        try:
            if os.path.exists("parameter_dictionary.js"):
                with open("parameter_dictionary.js", "r", encoding="utf-8") as f:
                    content = f.read()

                    # Find the start of the dictionary
                    import re
                    match = re.search(r'const\s+parameterDictionary\s*=\s*\{', content)
                    if not match:
                        match = re.search(r'var\s+parameterDictionary\s*=\s*\{', content)
                    if not match:
                        match = re.search(r'parameterDictionary\s*=\s*\{', content)

                    if match:
                        start_pos = match.end() - 1  # Include the opening {

                        # Find the matching closing brace
                        brace_count = 0
                        end_pos = start_pos
                        for i in range(start_pos, len(content)):
                            if content[i] == '{':
                                brace_count += 1
                            elif content[i] == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    end_pos = i + 1
                                    break

                        dict_str = content[start_pos:end_pos]

                        # Convert JS to Python
                        dict_str = dict_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')

                        try:
                            param_dict = ast.literal_eval(dict_str)
                        except Exception as e:
                            print(f"Failed to parse with ast: {e}")
                            # Try JSON approach
                            import json
                            dict_str = content[start_pos:end_pos]
                            # Already has quotes around keys in your format, so just parse
                            dict_str = dict_str.replace('true', 'true').replace('false', 'false').replace('null',
                                                                                                          'null')
                            param_dict = json.loads(dict_str)
                            print(f"✓ Loaded {len(param_dict)} parameters using JSON")
                    else:
                        print("Could not find parameterDictionary declaration")
            else:
                print("parameter_dictionary.js file not found!")

        except Exception as e:
            print(f"Error loading parameter_dictionary.js: {e}")
            import traceback
            traceback.print_exc()

        return param_dict

    def update_graphs(self):
        """Update all 6 graphs (4 periods + 1 summary with daily/weekly + 1 contribution)."""
        try:
            # Clear all axes
            for ax in self.axes_flat:
                ax.clear()

            # Filter data for current class
            class_df = self.df[self.df['userClass'] == self.current_class].copy()

            if len(class_df) == 0:
                for ax in self.axes_flat:
                    ax.text(0.5, 0.5, f'No data for Class {self.current_class}',
                            ha='center', va='center', fontsize=14)
                self.canvas.draw()
                return

            class_df['Day'] = class_df['date'].dt.date

            # Store bars for hover functionality
            self.hover_bars = {}

            # For each period (first 4 graphs)
            for period_idx, period in enumerate(self.periods):
                ax = self.axes_flat[period_idx]
                period_df = class_df[class_df['period'] == period].copy()

                if len(period_df) == 0:
                    ax.text(0.5, 0.5, f'No data for Period {period_idx + 1}',
                            ha='center', va='center', fontsize=12)
                    ax.set_title(f"Period {period}\n({self.get_period_label(period)})",
                                 fontsize=14, fontweight='bold')
                    ax.set_ylim(bottom=0)
                    continue

                # Group by taskLibraryId and calculate daily avg per user
                task_stats = []
                unique_task_ids = period_df['taskLibraryId'].unique()

                for task_id in unique_task_ids:
                    if pd.isna(task_id):
                        continue

                    task_df = period_df[period_df['taskLibraryId'] == task_id]
                    daily_user_points = task_df.groupby(['Day', 'studentId'])['calculated_points'].sum().values

                    if len(daily_user_points) > 0:
                        avg = np.mean(daily_user_points)
                        median = np.median(daily_user_points)
                        std = np.std(daily_user_points)
                        mad = np.median(np.abs(daily_user_points - median))

                        # Get decoded task info for hover
                        task_info_sample = task_df['taskInfo'].iloc[0]
                        decoded_task = self.decode_task_info(task_info_sample)

                        task_stats.append({
                            'task_id': int(task_id),
                            'avg': avg,
                            'median': median,
                            'std': std,
                            'mad': mad,
                            'n': len(daily_user_points),
                            'decoded_task': decoded_task
                        })

                if len(task_stats) == 0:
                    ax.text(0.5, 0.5, 'No task data', ha='center', va='center', fontsize=12)
                    ax.set_title(f"Period {period}\n({self.get_period_label(period)})",
                                 fontsize=14, fontweight='bold')
                    ax.set_ylim(bottom=0)
                    continue

                # Sort by task_id
                task_stats = sorted(task_stats, key=lambda x: x['task_id'])

                # Plot
                task_ids = [t['task_id'] for t in task_stats]
                avgs = [t['avg'] for t in task_stats]
                medians = [t['median'] for t in task_stats]
                stds = [t['std'] for t in task_stats]
                mads = [t['mad'] for t in task_stats]
                decoded_tasks = [t['decoded_task'] for t in task_stats]

                x = np.arange(len(task_ids))
                bar_color = self.period_colors[period_idx]

                # Plot bars for average
                bars = ax.bar(x, avgs, width=0.6, color=bar_color, alpha=0.8,
                              edgecolor='black', linewidth=1, label='Mean')

                # Store bar data for hover - key by axis
                self.hover_bars[ax] = []
                for i, (bar, task_id, avg, median, decoded) in enumerate(
                        zip(bars, task_ids, avgs, medians, decoded_tasks)):
                    self.hover_bars[ax].append({
                        'bar': bar,
                        'text': f"Task ID: {task_id}\nMean: {avg:.2f}\nMedian: {median:.2f}\n{decoded}"
                    })

                # Error bars for std
                ax.errorbar(x, avgs, yerr=stds, fmt='none', ecolor='red',
                            elinewidth=2, capsize=5, label='SD')

                # Median markers
                ax.scatter(x, medians, color='darkgreen', marker='D', s=50, zorder=5, label='Median')

                # MAD error bars
                ax.errorbar(x, medians, yerr=mads, fmt='none', ecolor='green',
                            elinewidth=2, capsize=5, label='MAD')

                ax.set_xticks(x)
                ax.set_xticklabels(task_ids, rotation=90, fontsize=10)
                ax.set_ylabel('Avg Daily Points per User', fontsize=12)
                ax.set_xlabel('Task ID', fontsize=12)
                ax.set_title(f"Period {period}\n({self.get_period_label(period)})",
                             fontsize=14, fontweight='bold')
                ax.legend(fontsize=10, loc='upper right')
                ax.grid(axis='y', alpha=0.3, linestyle='--')
                ax.set_ylim(bottom=0)

                # Overall graph (5th subplot) - BOTH DAILY AND WEEKLY WITH DUAL Y-AXES
                ax = self.axes_flat[4]
                all_df = self.df.copy()
                all_df['Day'] = all_df['date'].dt.date

                class_stats = []
                for user_class in sorted(all_df['userClass'].dropna().unique()):
                    class_subset = all_df[all_df['userClass'] == user_class]

                    # Calculate DAILY points per user
                    daily_user_points = class_subset.groupby(['Day', 'studentId'])['calculated_points'].sum().values

                    # Calculate WEEKLY earnings per user
                    user_weekly_earnings = []
                    for student_id in class_subset['studentId'].unique():
                        student_data = class_subset[class_subset['studentId'] == student_id].copy()
                        student_data = student_data.sort_values('date')

                        # Get first entry date
                        first_date = student_data['date'].min()
                        student_data['week'] = ((student_data['date'] - first_date).dt.days // 7)

                        # Group by week and count days with entries
                        weekly_data = student_data.groupby('week').agg({
                            'calculated_points': 'sum',
                            'Day': 'nunique'  # Count unique days
                        }).reset_index()

                        # Filter out weeks with 2 or fewer days
                        valid_weeks = weekly_data[weekly_data['Day'] > 2]

                        if len(valid_weeks) > 0:
                            user_weekly_earnings.extend(valid_weeks['calculated_points'].values)

                    if len(daily_user_points) > 0:
                        daily_avg = np.mean(daily_user_points)
                        daily_median = np.median(daily_user_points)
                        daily_std = np.std(daily_user_points)
                        daily_mad = np.median(np.abs(daily_user_points - daily_median))

                        weekly_avg = np.mean(user_weekly_earnings) if len(user_weekly_earnings) > 0 else 0
                        weekly_median = np.median(user_weekly_earnings) if len(user_weekly_earnings) > 0 else 0
                        weekly_std = np.std(user_weekly_earnings) if len(user_weekly_earnings) > 0 else 0
                        weekly_mad = np.median(np.abs(np.array(user_weekly_earnings) - weekly_median)) if len(
                            user_weekly_earnings) > 0 else 0

                        class_stats.append({
                            'class': int(user_class),
                            'daily_avg': daily_avg,
                            'daily_median': daily_median,
                            'daily_std': daily_std,
                            'daily_mad': daily_mad,
                            'weekly_avg': weekly_avg,
                            'weekly_median': weekly_median,
                            'weekly_std': weekly_std,
                            'weekly_mad': weekly_mad,
                            'n_daily': len(daily_user_points),
                            'n_weekly': len(user_weekly_earnings)
                        })

                # Store summary bars for click
                self.summary_bars = []

                if len(class_stats) > 0:
                    classes = [t['class'] for t in class_stats]
                    daily_avgs = [t['daily_avg'] for t in class_stats]
                    daily_medians = [t['daily_median'] for t in class_stats]
                    daily_stds = [t['daily_std'] for t in class_stats]
                    weekly_avgs = [t['weekly_avg'] for t in class_stats]
                    weekly_medians = [t['weekly_median'] for t in class_stats]
                    weekly_stds = [t['weekly_std'] for t in class_stats]

                    x = np.arange(len(classes))
                    width = 0.35

                    for other_ax in self.fig.axes:
                        if other_ax is not ax and other_ax.get_shared_x_axes().joined(other_ax, ax):
                            other_ax.remove()

                    # Create twin axis for weekly data
                    ax2 = ax.twinx()

                    # Plot daily bars on primary axis
                    bars1 = ax.bar(x - width / 2, daily_avgs, width, color='#9B59B6', alpha=0.8,
                                   edgecolor='black', linewidth=1, label='Daily Mean')
                    ax.errorbar(x - width / 2, daily_avgs, yerr=daily_stds, fmt='none',
                                ecolor='red', elinewidth=2, capsize=5)
                    ax.scatter(x - width / 2, daily_medians, color='darkgreen', marker='D',
                               s=50, zorder=5, label='Daily Median')

                    # Add text labels above daily bars
                    for i, (bar, avg, median) in enumerate(zip(bars1, daily_avgs, daily_medians)):
                        height = bar.get_height()
                        ax.text(bar.get_x() + bar.get_width() / 2, height + daily_stds[i] + 1,
                                f'μ:{avg:.1f}\nM:{median:.1f}',
                                ha='center', va='bottom', fontsize=9, color='#9B59B6', fontweight='bold')

                    # Store daily bars for click
                    for i, (bar, cls, avg, median) in enumerate(zip(bars1, classes, daily_avgs, daily_medians)):
                        self.summary_bars.append({
                            'bar': bar,
                            'text': f"Class {cls} - DAILY\nMean: {avg:.2f}\nMedian: {median:.2f}"
                        })

                    # Plot weekly bars on secondary axis
                    bars2 = ax2.bar(x + width / 2, weekly_avgs, width, color='#3498DB', alpha=0.8,
                                    edgecolor='black', linewidth=1, label='Weekly Mean')
                    ax2.errorbar(x + width / 2, weekly_avgs, yerr=weekly_stds, fmt='none',
                                 ecolor='orange', elinewidth=2, capsize=5)
                    ax2.scatter(x + width / 2, weekly_medians, color='darkblue', marker='D',
                                s=50, zorder=5, label='Weekly Median')

                    # Add text labels above weekly bars
                    for i, (bar, avg, median) in enumerate(zip(bars2, weekly_avgs, weekly_medians)):
                        height = bar.get_height()
                        ax2.text(bar.get_x() + bar.get_width() / 2, height + weekly_stds[i] + 2,
                                 f'μ:{avg:.1f}\nM:{median:.1f}',
                                 ha='center', va='bottom', fontsize=9, color='#3498DB', fontweight='bold')

                    # Store weekly bars for click
                    for i, (bar, cls, avg, median) in enumerate(zip(bars2, classes, weekly_avgs, weekly_medians)):
                        self.summary_bars.append({
                            'bar': bar,
                            'text': f"Class {cls} - WEEKLY\nMean: {avg:.2f}\nMedian: {median:.2f}"
                        })

                    ax.set_xticks(x)
                    ax.set_xticklabels([f"Class {c}" for c in classes], fontsize=12)
                    ax.set_ylabel('Daily Avg Points per User', fontsize=12, color='#9B59B6')
                    ax2.set_ylabel('Weekly Avg Points per User', fontsize=12, color='#3498DB')
                    ax.set_xlabel('User Class', fontsize=12)
                    ax.set_title(
                        f"Summary: Daily & Weekly Earnings per User by Class\n(Weekly: from first entry, weeks with 3+ days)",
                        fontsize=14, fontweight='bold')

                    # Combine legends
                    lines1, labels1 = ax.get_legend_handles_labels()
                    lines2, labels2 = ax2.get_legend_handles_labels()
                    ax.legend(lines1 + lines2, labels1 + labels2, fontsize=10, loc='upper right')

                    ax.grid(axis='y', alpha=0.3, linestyle='--')
                    ax.set_ylim(bottom=0)
                    ax2.set_ylim(bottom=0)
                    ax.tick_params(axis='y', labelcolor='#9B59B6')
                    ax2.tick_params(axis='y', labelcolor='#3498DB')
                else:
                    ax.text(0.5, 0.5, 'No overall data', ha='center', va='center', fontsize=12)
                    ax.set_ylim(bottom=0)

            # Contribution graph (6th subplot) - WITH HOVER
            ax = self.axes_flat[5]
            contrib_period = self.contrib_period_var.get()
            contrib_df = class_df[class_df['period'] == contrib_period].copy()

            if len(contrib_df) > 0:
                task_totals = contrib_df.groupby('taskLibraryId')['calculated_points'].sum()
                total_all_points = task_totals.sum()

                if total_all_points > 0:
                    task_percentages = (task_totals / total_all_points * 100).sort_values(ascending=False)
                    top_n = min(20, len(task_percentages))
                    task_percentages = task_percentages.head(top_n)

                    task_ids = [int(tid) for tid in task_percentages.index]
                    percentages = task_percentages.values

                    # Get decoded task info for each task
                    decoded_tasks_contrib = []
                    for task_id in task_ids:
                        task_info_sample = contrib_df[contrib_df['taskLibraryId'] == task_id]['taskInfo'].iloc[0]
                        decoded_task = self.decode_task_info(task_info_sample)
                        decoded_tasks_contrib.append(decoded_task)

                    y = np.arange(len(task_ids))

                    colors = plt.cm.YlOrRd(percentages / percentages.max())
                    bars = ax.barh(y, percentages, color=colors, edgecolor='black', linewidth=0.5)

                    # Store bar data for hover
                    self.hover_bars[ax] = []
                    for i, (bar, task_id, pct, decoded) in enumerate(
                            zip(bars, task_ids, percentages, decoded_tasks_contrib)):
                        self.hover_bars[ax].append({
                            'bar': bar,
                            'text': f"Task ID: {task_id}\nContribution: {pct:.1f}%\n{decoded}"
                        })

                    ax.set_yticks(y)
                    ax.set_yticklabels(task_ids, fontsize=10)
                    ax.set_xlabel('% of Total Points', fontsize=12)
                    ax.set_ylabel('Task ID', fontsize=12)
                    ax.set_title(
                        f"Task Contribution to Total Points\nClass {self.current_class} | Period {contrib_period}",
                        fontsize=14, fontweight='bold')
                    ax.grid(axis='x', alpha=0.3, linestyle='--')
                    ax.invert_yaxis()

                    for i, (task_id, pct) in enumerate(zip(task_ids, percentages)):
                        ax.text(pct + 0.5, i, f'{pct:.1f}%', va='center', fontsize=9)
                else:
                    ax.text(0.5, 0.5, 'No points data', ha='center', va='center', fontsize=12)
            else:
                ax.text(0.5, 0.5, f'No data for selected period', ha='center', va='center', fontsize=12)

            # Add hover annotation
            self.add_click_handler()

            self.fig.tight_layout(rect=[0, 0, 1, 0.97])
            self.canvas.draw()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to update graphs: {str(e)}\n{traceback.format_exc()}")

    def add_hover_annotation(self):
        """Add hover annotation functionality to bar charts (periods 1-4 and contribution graph)."""
        self.annot = None
        self.current_annot_ax = None

        def hover(event):
            # Check if hovering over period graphs (0-3) or contribution graph (5)
            valid_axes = self.axes_flat[:4] + [self.axes_flat[5]]

            if event.inaxes not in valid_axes:
                if self.annot and self.annot.get_visible():
                    self.annot.set_visible(False)
                    self.canvas.draw_idle()
                return

            # Check if we're hovering over a bar
            found = False
            if event.inaxes in self.hover_bars:
                for bar_data in self.hover_bars[event.inaxes]:
                    bar = bar_data['bar']
                    contains, _ = bar.contains(event)
                    if contains:
                        # Create or move annotation to correct axis
                        if self.annot is None or self.current_annot_ax != event.inaxes:
                            if self.annot:
                                self.annot.remove()
                            self.annot = event.inaxes.annotate("", xy=(0, 0), xytext=(20, 20),
                                                               textcoords="offset points",
                                                               bbox=dict(boxstyle="round", fc="yellow", alpha=0.95,
                                                                         edgecolor='black', linewidth=1),
                                                               arrowprops=dict(arrowstyle="->", color='black'),
                                                               fontsize=9)
                            self.current_annot_ax = event.inaxes

                        # Update annotation position based on bar orientation
                        if event.inaxes == self.axes_flat[5]:  # Horizontal bars (contribution graph)
                            x = bar.get_width()
                            y = bar.get_y() + bar.get_height() / 2

                            # For contribution graph, place annotation to the left to stay in view
                            # Get axis bounds
                            xlim = event.inaxes.get_xlim()

                            # If bar is on right side, place tooltip on left
                            if x > xlim[1] * 0.5:
                                self.annot.set_position((-20, 20))
                                self.annot.xytext = (-20, 20)
                            else:
                                self.annot.set_position((20, 20))
                                self.annot.xytext = (20, 20)

                        else:  # Vertical bars (period graphs)
                            x = bar.get_x() + bar.get_width() / 2
                            y = bar.get_height()

                            # Get axis bounds to determine positioning
                            xlim = event.inaxes.get_xlim()
                            ylim = event.inaxes.get_ylim()

                            # Smart positioning: adjust based on bar position
                            # If bar is on right side of graph, place tooltip to the left
                            if x > xlim[1] * 0.7:
                                xytext = (-120, 20)
                            # If bar is very tall, place tooltip below
                            elif y > ylim[1] * 0.7:
                                xytext = (20, -80)
                            else:
                                xytext = (20, 20)

                            self.annot.xytext = xytext

                        # Update annotation
                        self.annot.xy = (x, y)
                        self.annot.set_text(bar_data['text'])
                        self.annot.set_visible(True)
                        found = True
                        self.canvas.draw_idle()
                        break

            if not found and self.annot and self.annot.get_visible():
                self.annot.set_visible(False)
                self.canvas.draw_idle()

        self.canvas.mpl_connect("motion_notify_event", hover)


    def export_decoded_tasks_to_csv(self):
        """Add decoded task text to TaskLibrary.csv."""
        try:
            # Load TaskLibrary
            df_tasks = pd.read_csv("TaskLibrary.csv")

            # Add decoded column
            df_tasks['decodedTask'] = df_tasks['taskInfo'].apply(self.decode_task_info)

            # Save back to CSV
            df_tasks.to_csv("TaskLibrary.csv", index=False)

            print("✓ Added decoded tasks to TaskLibrary.csv")
            messagebox.showinfo("Success", "Decoded tasks added to TaskLibrary.csv")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to export decoded tasks: {str(e)}\n{traceback.format_exc()}")

    def get_period_label(self, period):
        """Get descriptive label for period."""
        labels = {
            "9-10": "Sep-Oct",
            "11-12": "Nov-Dec",
            "1-2": "Jan-Feb",
            "3-8": "Mar-Aug"
        }
        return labels.get(period, period)

    def update_weights_table(self):
        """Update the weights table for selected period."""
        current_period = self.weight_period_var.get()

        self.weights_context_label.config(
            text=f"Editing: Period {current_period} | Class {self.current_class}"
        )

        for item in self.weights_tree.get_children():
            self.weights_tree.delete(item)

        weights_dict = self.period_point_weights.get(current_period, {})
        for code, data in weights_dict.items():
            if "values" in data and len(data["values"]) > self.current_class:
                label = data.get("label", "")
                original_weight = data["values"][self.current_class]
                current_weight = self.get_task_weight(code, self.current_class, current_period)

                is_modified = abs(current_weight - original_weight) > 0.001
                tag = "modified" if is_modified else ""

                self.weights_tree.insert("", tk.END,
                                         values=(code, label, f"{current_weight:.3f}", f"{original_weight:.3f}"),
                                         tags=(tag,))

        self.weights_tree.tag_configure("modified", background="#FFF3CD")

    def on_weight_double_click(self, event):
        """Handle double-click for editing weight."""
        selection = self.weights_tree.selection()
        if not selection:
            return

        item = selection[0]
        code = self.weights_tree.item(item, "values")[0]
        current_value = float(self.weights_tree.item(item, "values")[2])
        original_value = float(self.weights_tree.item(item, "values")[3])

        self.create_edit_dialog(code, current_value, original_value, item)

    def create_edit_dialog(self, code, current_value, original_value, tree_item):
        """Create weight edit dialog."""
        current_period = self.weight_period_var.get()

        dialog = tk.Toplevel(self.weights_window)
        dialog.title(f"Edit Weight: {code}")
        dialog.update_idletasks()
        dialog.minsize(dialog.winfo_reqwidth(), dialog.winfo_reqheight())
        dialog.transient(self.weights_window)
        dialog.grab_set()

        main_frame = ttk.Frame(dialog, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(main_frame, text=f"Task Code: {code}", font=('Segoe UI', 12, 'bold')).pack(pady=(0, 10))
        ttk.Label(main_frame, text=f"Period: {current_period}", font=('Segoe UI', 10)).pack(pady=5)
        ttk.Label(main_frame, text=f"Class: {self.current_class}", font=('Segoe UI', 10)).pack(pady=5)
        ttk.Label(main_frame, text=f"Original weight: {original_value:.3f}", font=('Segoe UI', 10)).pack(pady=5)

        input_frame = ttk.Frame(main_frame)
        input_frame.pack(pady=10)

        ttk.Label(input_frame, text="New Weight:").pack(side=tk.LEFT, padx=(0, 10))
        weight_var = tk.StringVar(value=str(current_value))
        weight_entry = ttk.Entry(input_frame, textvariable=weight_var, width=15)
        weight_entry.pack(side=tk.LEFT)
        weight_entry.select_range(0, tk.END)
        weight_entry.focus()

        button_frame = ttk.Frame(main_frame)
        button_frame.pack(pady=20)

        def save_weight():
            try:
                new_weight = float(weight_var.get())

                if current_period not in self.modified_weights:
                    self.modified_weights[current_period] = {}

                if code not in self.modified_weights[current_period]:
                    weights_dict = self.period_point_weights[current_period]
                    self.modified_weights[current_period][code] = weights_dict[code]["values"].copy()

                self.modified_weights[current_period][code][self.current_class] = new_weight

                weights_dict = self.period_point_weights[current_period]
                label = weights_dict.get(code, {}).get("label", "")
                is_modified = abs(new_weight - original_value) > 0.001
                tag = "modified" if is_modified else ""

                self.weights_tree.item(tree_item,
                                       values=(code, label, f"{new_weight:.3f}", f"{original_value:.3f}"),
                                       tags=(tag,))

                self.update_all_displays()
                self.info_label.config(text=f"Updated {code}: {new_weight:.3f}")
                dialog.destroy()

            except ValueError:
                messagebox.showerror("Error", "Please enter a valid number")

        ttk.Button(button_frame, text="Save", command=save_weight, width=12).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=dialog.destroy, width=12).pack(side=tk.LEFT, padx=5)

        dialog.bind('<Return>', lambda e: save_weight())

    def reset_all_weights(self):
        """Reset all weights."""
        if messagebox.askyesno("Confirm", "Reset ALL weights for ALL periods?"):
            self.modified_weights = {}
            self.update_weights_table()
            self.update_all_displays()
            self.info_label.config(text="All weights reset")

    def reset_selected_weights(self):
        """Reset selected weights."""
        current_period = self.weight_period_var.get()
        selection = self.weights_tree.selection()
        if not selection:
            messagebox.showinfo("Info", "Please select weights to reset")
            return

        for item in selection:
            code = self.weights_tree.item(item, "values")[0]
            original_value = float(self.weights_tree.item(item, "values")[3])

            if current_period in self.modified_weights:
                if code in self.modified_weights[current_period]:
                    weights_dict = self.period_point_weights[current_period]
                    self.modified_weights[current_period][code][self.current_class] = original_value

            label = weights_dict.get(code, {}).get("label", "")
            self.weights_tree.item(item,
                                   values=(code, label, f"{original_value:.3f}", f"{original_value:.3f}"),
                                   tags=())

        self.update_all_displays()
        self.info_label.config(text=f"Reset {len(selection)} weights")

    def save_all_modifications(self):
        """Save all modified weights for all periods."""
        try:
            saved_files = []

            for period in self.period_point_weights.keys():
                filename = f"modified_weights_period_{period}.json"

                saved_weights = {}
                weights_dict = self.period_point_weights[period]

                for code, data in weights_dict.items():
                    if period in self.modified_weights and code in self.modified_weights[period]:
                        saved_weights[code] = {
                            "values": self.modified_weights[period][code],
                            "label": data["label"]
                        }
                    else:
                        saved_weights[code] = data.copy()

                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(saved_weights, f, ensure_ascii=False, indent=2, sort_keys=True)

                saved_files.append(filename)

            self.export_weights_for_html()

            messagebox.showinfo("Success", f"Saved modifications to:\n" + "\n".join(saved_files))
            self.info_label.config(text="All modifications saved")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to save: {str(e)}\n{traceback.format_exc()}")

    def export_weights_for_html(self):
        """Export all period weights in HTML-compatible JavaScript format."""
        period_mapping = {
            "9-10": "9-10",
            "11-12": "11-12",
            "1-2": "1-2",
            "3-8": "3-8"
        }

        output_lines = []

        for idx, (period, period_str) in enumerate(period_mapping.items()):
            weights_dict = {}
            original_weights = self.period_point_weights[period]

            for code, data in original_weights.items():
                if period in self.modified_weights and code in self.modified_weights[period]:
                    weights_dict[code] = {
                        "label": data["label"],
                        "values": self.modified_weights[period][code]
                    }
                else:
                    weights_dict[code] = data.copy()

            sorted_codes = sorted(weights_dict.keys())

            js_obj_parts = []
            for code in sorted_codes:
                label = weights_dict[code]["label"]
                values = weights_dict[code]["values"]
                values_str = str(values).replace(" ", "")
                js_obj_parts.append(f'"{code}":{{"label":"{label}","values":{values_str}}}')

            js_obj = "{" + ",".join(js_obj_parts) + "}"

            if idx == 0:
                output_lines.append(f'if (currentSchoolPeriod === "{period_str}") {{')
            else:
                output_lines.append(f'}} else if (currentSchoolPeriod === "{period_str}") {{')

            output_lines.append(f'  pointWeights = {js_obj}')

        output_lines.append('} else {')
        output_lines.append('  console.log("school period undefined - defaulting to 1-2");')

        default_period = "1-2"
        weights_dict = {}
        original_weights = self.period_point_weights[default_period]

        for code, data in original_weights.items():
            if default_period in self.modified_weights and code in self.modified_weights[default_period]:
                weights_dict[code] = {
                    "label": data["label"],
                    "values": self.modified_weights[default_period][code]
                }
            else:
                weights_dict[code] = data.copy()

        sorted_codes = sorted(weights_dict.keys())
        js_obj_parts = []
        for code in sorted_codes:
            label = weights_dict[code]["label"]
            values = weights_dict[code]["values"]
            values_str = str(values).replace(" ", "")
            js_obj_parts.append(f'"{code}":{{"label":"{label}","values":{values_str}}}')

        js_obj = "{" + ",".join(js_obj_parts) + "}"
        output_lines.append(f'  pointWeights = {js_obj}')
        output_lines.append('}')

        full_output = "\n".join(output_lines)

        print("\n" + "=" * 80)
        print("HTML-COMPATIBLE JAVASCRIPT OUTPUT:")
        print("=" * 80)
        print(full_output)
        print("=" * 80 + "\n")

        with open("weights_for_html.js", "w", encoding="utf-8") as f:
            f.write(full_output)

        print("✓ Weights exported to weights_for_html.js")

        return full_output

    def filter_weights_table(self):
        """Filter weights table based on search."""
        search_term = self.search_var.get().lower()

        all_items = list(self.weights_tree.get_children())

        if not search_term:
            return

        for item in all_items:
            values = self.weights_tree.item(item, "values")
            if not (search_term in values[0].lower() or search_term in values[1].lower()):
                self.weights_tree.detach(item)

    def clear_search(self):
        """Clear search filter."""
        self.search_var.set("")
        for item in self.weights_tree.get_children(''):
            self.weights_tree.reattach(item, '', 'end')


def main():
    root = tk.Tk()
    app = TaskPointsAnalyzer(root)
    root.mainloop()


if __name__ == "__main__":
    main()