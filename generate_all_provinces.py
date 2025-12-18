"""
Generate housing gap heatmaps for all provinces
"""

import os
from generate_housing_gap_charts import generate_all_housing_charts

# List of all provinces with their CSV files and Thai names
provinces = [
    {'csv': 'housing_chart/BKK.csv', 'name': 'กรุงเทพมหานคร'},
    {'csv': 'housing_chart/ขอนแก่น.csv', 'name': 'เทศบาลนครขอนแก่น'},
    {'csv': 'housing_chart/เชียงใหม่.csv', 'name': 'เทศบาลนครเชียงใหม่'},
    {'csv': 'housing_chart/เทศบาลนครยะลา.csv', 'name': 'เทศบาลนครยะลา'},
    {'csv': 'housing_chart/เทศบาลนครสุราษฎร์ธานี.csv', 'name': 'เทศบาลนครสุราษฎร์ธานี'},
    {'csv': 'housing_chart/เทศบาลเมืองกะทู้.csv', 'name': 'เทศบาลเมืองกะทู้ ภูเก็ต'},
    {'csv': 'housing_chart/เทศบาลเมืองฉะเชิงเทรา.csv', 'name': 'เทศบาลเมืองฉะเชิงเทรา'},
    {'csv': 'housing_chart/เทศบาลลาดสวาย ปทุมธานี.csv', 'name': 'เทศบาลลาดสวาย ปทุมธานี'},
    {'csv': 'housing_chart/ภูเก็ต 2 อำเภอ.csv', 'name': 'ภูเก็ต 2 อำเภอ'},
    {'csv': 'housing_chart/ร้อยเอ็ด.csv', 'name': 'เทศบาลเมืองร้อยเอ็ด'},
    {'csv': 'housing_chart/ศรีสะเกษ.csv', 'name': 'เทศบาลเมืองศรีสะเกษ'},
    {'csv': 'housing_chart/หาดใหญ่.csv', 'name': 'เทศบาลนครหาดใหญ่'},
    {'csv': 'housing_chart/อำเภอลำลูกกา อำเภอธัญบุรี.csv', 'name': 'อำเภอลำลูกกา อำเภอธัญบุรี ปทุมธานี'},
]

def main():
    """Generate charts for all provinces"""
    print("\n" + "="*80)
    print("GENERATING HOUSING GAP HEATMAPS FOR ALL PROVINCES")
    print("="*80 + "\n")

    total_provinces = len(provinces)
    successful = 0
    failed = []

    for i, province in enumerate(provinces, 1):
        print(f"\n[{i}/{total_provinces}] Processing: {province['name']}")
        print("-" * 80)

        try:
            # Check if CSV file exists
            if not os.path.exists(province['csv']):
                print(f"  ⚠ WARNING: File not found - {province['csv']}")
                failed.append(province['name'])
                continue

            # Generate charts
            generate_all_housing_charts(
                csv_file=province['csv'],
                province_name=province['name']
            )
            successful += 1
            print(f"  ✓ Success: {province['name']}")

        except Exception as e:
            print(f"  ✗ ERROR: Failed to generate charts for {province['name']}")
            print(f"    Error: {str(e)}")
            failed.append(province['name'])

    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Total provinces: {total_provinces}")
    print(f"Successful: {successful}")
    print(f"Failed: {len(failed)}")

    if failed:
        print("\nFailed provinces:")
        for name in failed:
            print(f"  - {name}")

    print("\n" + "="*80)
    print(f"All charts saved in: housing_gap_charts/")
    print("="*80 + "\n")


if __name__ == '__main__':
    main()
