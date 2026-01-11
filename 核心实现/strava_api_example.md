---

## API请求

获取列表的请求：
GET https://www.strava.com/athlete/training_activities?keywords=&sport_type=&tags=&commute=&private_activities=&trainer=&gear=&search_session_id=713a4fa7-6e72-4636-ba77-0ac44efd3f13&new_activity_only=false

{
    "models": [
        {
            "id": 16922821055,
            "name": "晚间骑行001",
            "sport_type": "Run",
            "display_type": "Run",
            "activity_type_display_name": "Run",
            "private": false,
            "bike_id": null,
            "athlete_gear_id": null,
            "start_date": "Tue, 12/30/2025",
            "start_date_local_raw": 1767056400,
            "start_time": "2025-12-30T00:00:00+0000",
            "start_day": "Tue",
            "distance": "78.06",
            "distance_raw": 125626.0,
            "long_unit": "miles",
            "short_unit": "mi",
            "moving_time": "4:10:54",
            "moving_time_raw": 15054,
            "elapsed_time": "4:10:54",
            "elapsed_time_raw": 15054,
            "trainer": true,
            "static_map": null,
            "has_latlng": true,
            "commute": null,
            "elevation_gain": "0",
            "elevation_unit": "ft",
            "elevation_gain_raw": 0,
            "description": "",
            "activity_url": "https://www.strava.com/activities/16922821055",
            "activity_url_for_twitter": "https://www.strava.com/activities/16922821055?utm_content=154862811\u0026utm_medium=referral\u0026utm_source=twitter",
            "twitter_msg": "went for a 78.0 mile Run.",
            "is_changing_type": false,
            "suffer_score": null,
            "tags": {
                "6": false,
                "8": false,
                "9": false,
                "2": true,
                "7": false,
                "4": false,
                "11": false,
                "15": false,
                "10": false,
                "5": true
            },
            "selected_tag_type": 2,
            "flagged": false,
            "hide_power": false,
            "hide_heartrate": false,
            "visibility": "followers_only"
        }
    ],
    "page": 1,
    "perPage": 20,
    "total": 1
}


快捷修改的请求：
PUT https://www.strava.com/athlete/training_activities/16922821055
request body：{"id":16922821055,"name":"晚间骑行001","sport_type":"Run","display_type":"Run","activity_type_display_name":"Run","private":false,"bike_id":"","athlete_gear_id":"","start_date":"Tue, 12/30/2025","start_date_local_raw":1767056400,"start_time":"2025-12-30T00:00:00+0000","start_day":"Tue","distance":"78.06","distance_raw":125626,"long_unit":"miles","short_unit":"mi","moving_time":"4:10:54","moving_time_raw":15054,"elapsed_time":"4:10:54","elapsed_time_raw":15054,"trainer":true,"static_map":null,"has_latlng":true,"commute":false,"elevation_gain":"0","elevation_unit":"ft","elevation_gain_raw":0,"description":"","activity_url":"https://www.strava.com/activities/16922821055","activity_url_for_twitter":"https://www.strava.com/activities/16922821055?utm_content=154862811&utm_medium=referral&utm_source=twitter","twitter_msg":"went for a 78.0 mile Run.","is_changing_type":false,"suffer_score":null,"tags":{"2":true,"4":false,"5":true,"6":false,"7":false,"8":false,"9":false,"10":false,"11":false,"15":false},"selected_tag_type":2,"flagged":false,"hide_power":false,"hide_heartrate":false,"visibility":"everyone","tag_type":"2","tag_type_ride":"2","tag_type_run":"2"}
rsp 
{
    "id": 16922821055,
    "name": "晚间骑行001",
    "sport_type": "Run",
    "display_type": "Run",
    "activity_type_display_name": "Run",
    "private": false,
    "bike_id": null,
    "athlete_gear_id": null,
    "start_date": "Tue, 12/30/2025",
    "start_date_local_raw": 1767056400,
    "start_time": "2025-12-30T00:00:00+0000",
    "start_day": "Tue",
    "distance": "78.06",
    "distance_raw": 125626.0,
    "long_unit": "miles",
    "short_unit": "mi",
    "moving_time": "4:10:54",
    "moving_time_raw": 15054,
    "elapsed_time": "4:10:54",
    "elapsed_time_raw": 15054,
    "trainer": true,
    "static_map": null,
    "has_latlng": true,
    "commute": false,
    "elevation_gain": "0",
    "elevation_unit": "ft",
    "elevation_gain_raw": 0,
    "description": "",
    "activity_url": "https://www.strava.com/activities/16922821055",
    "activity_url_for_twitter": "https://www.strava.com/activities/16922821055?utm_content=154862811\u0026utm_medium=referral\u0026utm_source=twitter",
    "twitter_msg": "went for a 78.0 mile Run.",
    "is_changing_type": false,
    "suffer_score": null,
    "tags": {
        "6": false,
        "8": false,
        "9": false,
        "2": true,
        "7": false,
        "4": false,
        "11": false,
        "15": false,
        "10": false,
        "5": false
    },
    "selected_tag_type": 2,
    "flagged": false,
    "hide_power": false,
    "hide_heartrate": false,
    "visibility": "everyone"
}

---