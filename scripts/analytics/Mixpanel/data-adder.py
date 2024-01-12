import pandas as pd

# Load data from CSV
data = pd.read_csv(
    "/Users/ivanfarias/Downloads/Table Multi Apps_Insights_2023-12-01_to_2023-12-31.csv"
)


# Define the grouping rules
def assign_group(row):
    multi_app, os, utms, language = (
        row["Multi-app (at time of event)"],
        row["OS (Simple Group)"],
        row["UTMs (Grouped)"],
        row["Account's Last Language"],
    )

    # Define default group label
    group_label = "Undefined Group"

    if multi_app == "Kyte Catálogo":
        if os == "Android":
            if utms == "CRM":
                group_label = "Others - Mobile"
            elif utms == "SEO":
                group_label = f"SEO Mobile - {language.upper()}"
            else:  # undefined UTMs
                group_label = f"Kyte Catálogo - Android - ASO"
        elif os == "iOS":
            if utms == "SEO":
                group_label = f"SEO Mobile - {language.upper()}"
            else:  # undefined UTMs
                group_label = f"Kyte Catálogo - iOS - ASO"
        elif os == "Web":
            group_label = "SEO Desktop - PT" if language == "pt" else group_label

    elif multi_app == "Kyte PDV":
        if os == "Android":
            if utms in ["CRM", "Internal", "Product Sharing", "Social"]:
                group_label = "Others - Mobile"
            elif utms == "SEO":
                group_label = f"SEO Mobile - {language.upper()}"
            else:  # undefined UTMs
                group_label = f"Kyte PDV - Android - ASO"
        elif os == "iOS":
            if utms == "CRM":
                group_label = "Others - Mobile"
            elif utms == "SEO":
                group_label = f"SEO Mobile - {language.upper()}"
            else:  # undefined UTMs
                group_label = f"Kyte PDV - iOS - ASO"
        elif os == "Web":
            if utms in ["CRM", "Product Sharing", "Referral", "Social"]:
                group_label = "Others - Desktop"
            elif utms == "SEO":
                group_label = f"SEO Desktop - {language.upper()}"
            else:  # undefined UTMs
                group_label = "SEO Desktop - UNDEFINED"
        else:  # undefined OS
            if utms == "SEO":
                group_label = "SEO Desktop - PT" if language == "pt" else group_label
            else:  # undefined UTMs
                group_label = f"Kyte PDV - Android - ASO"

    else:  # undefined Multi-app
        if os == "Android":
            if utms in ["CRM", "Product Sharing"]:
                group_label = "Others - Mobile"
            elif utms == "SEO":
                group_label = f"SEO Mobile - {language.upper()}"
            else:  # undefined UTMs
                group_label = f"Kyte PDV - Android - ASO"
        elif os == "iOS":
            if utms == "CRM":
                group_label = "Others - Mobile"
            elif utms == "SEO":
                group_label = f"SEO Mobile - {language.upper()}"
            else:  # undefined UTMs
                group_label = f"Kyte PDV - iOS - ASO"
        elif os == "Web":
            if utms in ["CRM", "Social"]:
                group_label = "Others - Desktop"
            elif utms == "SEO":
                group_label = f"SEO Desktop - {language.upper()}"
            else:  # undefined UTMs
                group_label = "SEO Desktop - UNDEFINED"

    return group_label


# Apply the grouping rules to each row
data["Group Label"] = data.apply(assign_group, axis=1)

# Save the grouped data to a new CSV file
data.to_csv("grouped_data.csv", index=False)

print("Grouping complete. Data saved to 'grouped_data.csv'.")
