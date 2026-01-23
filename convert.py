import pandas as pd

df = pd.read_excel("Flight_Data_80_Entries.xlsx")

df.to_json(
    "src/data/flights.json",
    orient="records",
    indent=2
)

print("JSON created successfully")
